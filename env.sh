alias wsloop="while true; do echo RESTART ; sleep 1; python -m mystarship ; done"

if [ -d .v ]
then
    echo .v exists
else
    virtualenv .v
    .v/bin/pip install -r requirements.txt
fi

. .v/bin/activate
