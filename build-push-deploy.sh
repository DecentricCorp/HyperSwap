./build-push.sh $1
cd k8s/
./un-deploy.sh
./deploy.sh
cd ..