output "configuration_set_name" {
  description = "Set this as SES_CONFIGURATION_SET in the api's environment"
  value       = aws_sesv2_configuration_set.dispatch.configuration_set_name
}

output "ses_events_topic_arn" {
  description = "Set this as SES_EVENTS_TOPIC_ARN in the api's environment"
  value       = aws_sns_topic.ses_events.arn
}
