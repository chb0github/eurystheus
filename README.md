# Eurystheus
## Of the 12 labors of Hercules
> NCP task management system

to view this doc correctly use a Github style plugin 

The overriding assumptions about this webservice is
 
1. It will know nothing of workflows
2. It will know nothing of active directory, etc. 
3. The following requirements for tasks are:
 1. status is discoverable
 2. automatic expiration
 3. escalation will be essential
 4. Media for interacting with users may ultimately have to support any hodge-podge combination (email, sms, etc.)
 5. The concept of a multi-lingual thesaurus may be a requirement and may need complex logic. 
   1. This may transition into a preprocessor step. (normalization of input, NLP, Etc.) 
 6. Determining a valid message may require complex logic
 7. Reminders ( do we need to skip business days?)
4. In addition to product requirements, the following technical requirements are being put in place
 1. Delivery methods for task-complete notification may extend well beyond a simple webhook
 2. There may be any number of interested parties in the completion of a task and they require notification
 3. The system must be horizontally scalable. 
 4. Payload validation is essential
 5. To aid in integration we must allow a user a custom key for task reconciliation. 
 6. Resources for task administration must be available (for a task to complete with a certain status)
 7. All resources must be discoverable and connected. 
5. Authentication/authorization is currently not implemented as requirements for and integration with auth0 are still 
6. Tenancy: One instance of this service per tenant. This means that the tenancy will need to be communicated to the docker instance on start (per MKP)
ongoing

**POST** _/tasks_
produces: application/json, text/plain (just the id). 

The valid fields of this call will depend on the 'method' field. For the time being, only email is supported (sample below).

        {
            "method": "email",
            "description" : "Task for requesting time off",
            "outcomes": 1,
            "quorum": "first-responder",
            "thesaurus": 1,
            "expiration": {
                "at": "2015-09-30T01:29:20.614Z",
                "response": "yes"
            },
            "notifiers": [
                {
                    "type": "webhook",
                    "endpoint": "http://localhost:8080/taskcomplete",
                    "method": "POST",
                    "routing-key": "user-defined-routing-key",
                    "content-type": "application/json"
                }
            ],
            "reminders" : ["2015-09-30T01:29:20.614Z","2015-09-30T01:29:20.614Z","2015-09-30T01:29:20.614Z"],
            "message": "Joe Smith is requesting 3 days off from 9/10/2015 to 9/13/2015",
            "to": [
                {
                    "assignee": "christian.bongiorno@gmail.com",
                    "escalation": [
                        {
                            "after": "2015-09-30T01:29:20.614Z",
                            "method": "email",
                            "to": "christian.bongiorno@gmail.com"
                        },
                        {
                            "after": "2015-09-30T01:29:20.614Z",
                            "method": "email",
                            "to": "christian.bongiorno@gmail.com"
                        }
                    ]
                }
            ],
            "from": "TimeOff@company.com",
            "subject": "Time off request for Renai Bell"
        }

Field-by-field description:
* **method**: the method for the task system to communicate with the end user. Presume to support email/sms/IM/composite at some point

* **description**: the task description

* **outcomes**: the id of the list of valid outcomes. As these may be quite numerous and difficult to name, they are numbered

* **quorum**: The id of the logic module to use for achieving a quorum (aka: vote). May be gotten by **GET** _/quorum_

* **thesaurus**: The thesaurus module to use to translate 'yeah, definitely' etc to 'yes'. Intended to be language available. 
May be gotten by **GET** _/thesauri_

* **Expiration**: Self explanatory. 
  * **at** is a date-time descriptor as defined by ISO 8601.
  * **response** The response to send upon vote expiration. The this become the final status of the task

* **notifiers**: An array of notification configurations. Currently only POST-back is supported but you can send it to any number of destinations. at least, that's the idea
  * **webhook**
    * **type**: The type of notifier, in this case it should be "webhook"
    * **endpoint**: The endpoint to notify.
    * **method**: The HTTP method to use when notifiying the endpoint (GET|POST|PUT|PATCH)
    * **routing-key**: A user-defined value to help with routing on the notifier side
    * **content-type**: The desired content-type of the notification.

* **reminders**: Sends out a reminder at said times. This allows for absolute notifications. Currently unsupported

* **message**: The message to send for the task. The allowable replies will be system generated. 
Something like: ${message}\r\nYou may reply with ${outcomes}

* **to**: The recipient of the message.
  * **assignee**: The email address of the assignee.
  * **escalation**: The escalation path for the assignee
    * **after**: The date after which the task should be escalated to this assignee
    * **method**: The method with which to interact with the new assignee.
    * **to**: The way to interact with the assignee (email/sms/etc)

* **from**: A user definied 'from'. This will have limitations and may ultimately be removed

* **subject**: This really only applies to email. 



**GET** _/tasks/:id_

Get the details of a task by it's id. 

Fields included in GET that were not in POST:

* **created**: The zulutime the task was created. This is local to the server that received the request

* **status**: The current status of the task. All tasks start immediately with a status of 'active' 

* **votes**: The status of all votes supplied for this task. If the task has just been created, this will be empty. Sample:
  * **who**: who cast the vote
  * **what**: Their vote (raw) 
  * **when**: When the vote was cast 
  * **synonym**: The output from your chosen thesaurus determining the synonym 
  * **message**: The full message received in the email. Line by line. Extra newlines are trimmed 

            "votes" : [
              {
                "who" : "christian.bongiorno@gmail.com",
                "what" : "yes",
                "when" : "2015-11-05T00:43:41.717Z",
                "synonym" : "yes",
                "message" : ["Just make sure this is in the final email"]
              },
              {
                "who" : "christian.bongiorno@gmail.com",
                "what" : "yes",
                "when" : "2015-11-05T00:43:41.717Z",
                "synonym" : "yes",
                "message" : ["Just make sure this is in the final email"]
              }
            ]


**GET** _/tasks?from=<zulutime>&to=<zulu-time>&status=<regex match>_

Returns all tasks filtered by dates and status. Same as **GET** _/tasks/:id_

**GET** _/quorum_

Returns all qui (accusative, plural of quorum) (A.K.A voting logic). Sample payload: 
example:

       [
         {
           "description": "Task is complete on first legit response",
           "friendlyName": "First Response",
           "id": "first-responder"
         }
       ]



**GET** _/thesauri_

Returns all thesauri. A thesaurus is more than just a K/V pair mapping. It also applies function so that any level of complexity
can be encapsulated. In addition, a thesaurus is language specific to support i18n
Example:

       [
           {
             "id": "yes-no-absolute-thesaurus",
             "description": "Only yes/no are allowed in US English",
             "friendlyName": "Yes or No only",
             "locale": "en_US"
           },
           {
             "id": "yes-no-thesaurus",
             "description": "Will take various forms of 'yes' and 'no' in US English",
             "friendlyName": "Colloquial Yes/No",
             "locale": "en_US"
           }
       ]


**GET** _/notifiers_

Returns an array of all of the notification methods available and their required arguments

       [
         {
           "id": "webhook",
           "description": "Will send the results of the task as a webhook (A.K.A POSTBack)",
           "friendlyName": "Webhook",
           "args": {
               "endpoint": "http URL",
               "method": "the HTTP verb for submit. POST/PUT",
               "content-type": "currently only 'application/json' is supported"
           }
         }
       ]

**GET** _/outcomes_

Returns all the outcomes that may be selected for use in the creation of a task

       {
           "values": ["yes","no"],
           "id": 1
       }


