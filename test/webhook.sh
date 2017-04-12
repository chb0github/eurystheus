#!/usr/bin/env bash
cat $1 | curl -XPOST -d @-  -H "content-type: application/x-www-form-urlencoded" http://localhost:7070/webhook/email/mandrill

