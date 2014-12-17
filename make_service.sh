SERVICE_NAME=$1
PORT=$2

mkdir static
mkdir $SERVICE_NAME
mkdir $SERVICE_NAME/static
ln -s $SERVICE_NAME/static static/$SERVICE_NAME

echo "PORT=$PORT python -m$SERVICE_NAME $*" >run_$SERVICE_NAME.sh

cat >$SERVICE_NAME/static/index.html <<EOF
<doctype html>
<html>
<body>
Hello
</body>
</html>
EOF

cat >$SERVICE_NAME/service.py <<EOF
import mystarship
if __name__=='__main__': mystarship.launch()
EOF
