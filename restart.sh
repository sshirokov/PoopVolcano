#!/usr/bin/env bash
BASE_DIR=`dirname $0`
PIDFILE_NAME="poopvolcano.pid"
PIDFILE="$BASE_DIR/$PIDFILE_NAME"
CMD="nohup ./app.js"

function log() {
    local LEVELS=("DEBUG" "INFO" "WARNING" "ERROR")
    local LEVEL="INFO"
    local MESSAGE="$@"
    local STAMP=$(date +'%m/%d/%y -- %H:%M:%S')

    if [[ "$#" == "0" ]]; then
        echo "ERROR: You're passing nothing to log!"
        exit 1
    elif [[ "$#" > "1" ]]; then
        local MAYBE_LEVEL=$1

        # See if the first param names a level when we have more params
        (for level in ${LEVELS[@]};
            do [[ "$level" == "$MAYBE_LEVEL" ]] && exit 1;
            done; exit 0;
        ) || {
            # Found a known level
            LEVEL="$MAYBE_LEVEL";
            shift;
            MESSAGE="$@"
        }
    fi

    echo "$STAMP [$LEVEL]: $MESSAGE";
};

function start() {
    log "DEBUG" "$>" "$CMD"
    $CMD &
    PID="$!"
    log "DEBUG" "PID: $PID"
    echo "$PID" > "$PIDFILE"
};

# Prepare
cd $BASE_DIR
log "Operating in $BASE_DIR"

# Kill or warn
if [[ -f "$PIDFILE" ]]; then
    PID=`cat $PIDFILE`
    log "FOUND PID: $PID"
    kill "$PID" && {
        log "Killed process at $PID"
    } || {
        log "WARNING" "No process existed at $PID"
    }
else
    log "WARNING" "No PID found at $PIDFILE"
fi

# [Re]Start
start


