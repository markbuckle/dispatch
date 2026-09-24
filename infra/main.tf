terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
  }
}

provider "aws" {
  region = var.region
}

# every send names this set, and a send that does not name it reports nothing back
resource "aws_sesv2_configuration_set" "dispatch" {
  configuration_set_name = var.configuration_set_name
}

resource "aws_sns_topic" "ses_events" {
  name = var.topic_name
}

# SNS will not publish to a topic it cannot write to, and the default policy does not cover SES
resource "aws_sns_topic_policy" "ses_events" {
  arn = aws_sns_topic.ses_events.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ses.amazonaws.com" }
        Action    = "SNS:Publish"
        Resource  = aws_sns_topic.ses_events.arn
        Condition = {
          StringEquals = { "AWS:SourceAccount" = data.aws_caller_identity.current.account_id }
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

# the four that say what became of a message; opens and clicks are a different feature and are not collected
resource "aws_sesv2_configuration_set_event_destination" "sns" {
  configuration_set_name = aws_sesv2_configuration_set.dispatch.configuration_set_name
  event_destination_name = "${var.configuration_set_name}-sns"

  event_destination {
    enabled              = true
    matching_event_types = ["DELIVERY", "BOUNCE", "COMPLAINT", "DELIVERY_DELAY"]

    sns_destination {
      topic_arn = aws_sns_topic.ses_events.arn
    }
  }
}

# stays pending until the endpoint answers the confirmation, which it cannot do from a laptop
resource "aws_sns_topic_subscription" "api" {
  topic_arn              = aws_sns_topic.ses_events.arn
  protocol               = "https"
  endpoint               = var.api_notification_url
  endpoint_auto_confirms = true
  raw_message_delivery   = false
}
