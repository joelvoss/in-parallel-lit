#!/bin/bash

set -e
PATH=./node_modules/.bin:$PATH

# //////////////////////////////////////////////////////////////////////////////
# START tasks

start() {
  echo "Please run \"node src/bin.js [options]\" in your shell directly."
}

format() {
  jvdx format $*
}

lint() {
  jvdx lint $*
}

test() {
  FORCE_COLOR=1 jvdx test --testPathPattern=/tests $*
}

validate() {
  lint $*
  test $*
}

clean() {
  jvdx clean $*
}

default() {
  echo "Unknown task."
  echo "Usage:"
  echo " $ ./Taskfile.sh start [--flags]"
  echo ""
}

# END tasks
# //////////////////////////////////////////////////////////////////////////////

${@:-default}
