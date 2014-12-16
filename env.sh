alias wsloop="while true; do echo RESTART ; python -m mystarship ; done"

install () {
  if [ -d .v ]
  then
    echo .v exists
  else
    virtualenv .v
  fi
  . .v/bin/activate
  pip install -r requirements.txt
}

. .v/bin/activate
