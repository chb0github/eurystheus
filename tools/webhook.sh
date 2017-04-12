#!/usr/bin/env bash
cat $1 | curl -XPOST -d @-  -H "content-type: application/x-www-form-urlencoded" $2/webhook/email/mandrill

