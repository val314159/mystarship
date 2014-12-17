SERVICE_NAME=$1
PORT=$2

mkdir $SERVICE_NAME
mkdir $SERVICE_NAME/static
echo "hello there" >$SERVICE_NAME/static/index.html
echo "import mystarship" >$SERVICE_NAME/service.py
echo "PORT=$PORT python -m mystarship" >run_$SERVICE_NAME.sh

cat >$SERVICE_NAME/service.py <<EOF
import mystarship
if __name__=='__main__': launch()
EOF
