variable "region" {
  description = "AWS region, matching SES_SENDER_REGION in the api's environment"
  type        = string
  default     = "us-east-1"
}

variable "configuration_set_name" {
  description = "Name of the SES configuration set, passed to the api as SES_CONFIGURATION_SET"
  type        = string
  default     = "dispatch-events"
}

variable "topic_name" {
  description = "Name of the SNS topic SES publishes events to"
  type        = string
  default     = "dispatch-ses-events"
}

# no default, because the url belongs to a deployment rather than to the repo
variable "api_notification_url" {
  description = "Public https URL of the api's SNS route, ending in /sns/ses"
  type        = string
}
