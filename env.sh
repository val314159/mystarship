alias wsloop="while true; do echo RESTART ; python -mmystarship.ws ; done"

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
