# infra

Terraform for the SES event pipeline: a configuration set, an SNS topic, and an https subscription pointing at the api. Applied by hand. State is local and gitignored so whoever applies this holds the only copy.

## What it creates

| Resource | Why |
|---|---|
| `aws_sesv2_configuration_set` | Every send names it, and a send that does not name it reports nothing back |
| `aws_sesv2_configuration_set_event_destination` | Routes DELIVERY, BOUNCE, COMPLAINT and DELIVERY_DELAY to the topic |
| `aws_sns_topic` | Where those four land |
| `aws_sns_topic_policy` | SES cannot publish to the topic without it |
| `aws_sns_topic_subscription` | Delivers them to the api over https |

## Variables

| Variable | Default | Notes |
|---|---|---|
| `region` | `us-east-1` | Match `SES_SENDER_REGION` in the api's environment |
| `configuration_set_name` | `dispatch-events` | |
| `topic_name` | `dispatch-ses-events` | |
| `api_notification_url` | none | Public https URL ending in `/sns/ses` |

## Applying

```
cd infra
terraform init
terraform apply -var="api_notification_url=https://<the deployed api>/sns/ses"
```

Then set two values in the api's environment, both printed as outputs:

```
SES_CONFIGURATION_SET=dispatch-events
SES_EVENTS_TOPIC_ARN=arn:aws:sns:us-east-1:<account>:dispatch-ses-events
```

## The subscription stays pending, and that is normal

SNS confirms a subscription by POSTing a `SubscriptionConfirmation` to the endpoint and
waiting for something to visit the `SubscribeURL` inside it. The api does that
automatically, but only once it is deployed and publicly reachable. Until then the
subscription sits in `PendingConfirmation` and no events arrive. That is the expected
state, not a failed apply.

This is why `terraform apply` from a laptop leaves you with a pending subscription:
localhost is not somewhere SNS can POST to. The order that works is deploy the api
first, then apply with its real URL, then send a test email and watch the endpoint's
delivery log fill in.

If a subscription has been pending long enough to expire, delete and re-apply the
`aws_sns_topic_subscription` resource rather than waiting; SNS does not retry a
confirmation forever.
