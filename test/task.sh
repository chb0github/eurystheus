#!/usr/bin/env bash
cat $1 | curl -XPOST -d @- -H "content-type: application/json" http://localhost:7070/tasks

