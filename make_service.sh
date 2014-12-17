SERVICE_NAME=$1
PORT=$2

mkdir -p static/$SERVICE_NAME
mkdir $SERVICE_NAME
(cd $SERVICE_NAME ; ln -s ../static/$SERVICE_NAME static)

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
