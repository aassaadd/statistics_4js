REGISTRY_URL=182.92.231.235:5000
APP_IMAGES_NAME=qw/activity1
APP_V=2.0.3
#
docker rmi $REGISTRY_URL/$APP_IMAGES_NAME:$APP_V
docker build -t $REGISTRY_URL/$APP_IMAGES_NAME:$APP_V .
docker push $REGISTRY_URL/$APP_IMAGES_NAME:$APP_V

#docker service create --network ck-network --replicas 1 --name ckactivity20180108 -p 3000:3000 182.92.231.235:5000/ck/ckactivity20180108:1.0.0