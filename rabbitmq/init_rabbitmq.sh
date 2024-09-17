#!/bin/bash

rabbitmq-plugins enable rabbitmq_management

# Create default queue
rabbitmqadmin declare queue name=HRMS_QUEUE_1 durable=true