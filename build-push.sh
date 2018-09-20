docker build . -t us.gcr.io/newagent-9575d/hubserver:v1 $1
gcloud docker -- push us.gcr.io/newagent-9575d/hubserver:v1