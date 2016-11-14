#!/usr/bin/env node

const file = process.argv[2];
if (!file) {
  const processName = process.argv[1].split(/\\|\//g).pop();
  console.error('usage ' + processName + ' file');
  process.exit(1);
}

const fs = require('fs');

const source = fs.readFileSync(file).toString();

const flags = {};

const newSource = source.replace(/^<<"FLAGS"$([\s\S]+)^FLAGS$/m, ($_, flagsMatch) => {
  flagsMatch.split('\n').forEach(line => {
    if (/^\s*$/.test(line)) { return; }
    var [, longName, shortName, isBoolean] = /(\w+)(?:=(\w))?(!)?/.exec(line);
    flags[longName] = { shortName, isBoolean };
  });
  var prefilled = ['args=()'].concat(Object.keys(flags).map(flag => {
    return flag + '=';
  })).join('\n') + '\n';

  var loopStart = `while [[ $# -gt 0 ]]; do
    key=$1
    case $key in`;
  var loopBody = '';
  for (var flagName in flags) {
    const { shortName, isBoolean } = flags[flagName];
    if (isBoolean) {
      loopBody += `

        ${shortName ? `-${shortName}|` : ''}--${flagName})
        ${flagName}=1
        shift
        ;;`;
    } else {
      loopBody += `

        ${shortName ? `-${shortName}=*|` : ''}--${flagName}=*)
        ${flagName}="$` + `{key#*=}"
        shift
        ;;

        ${shortName ? `-${shortName}|` : ''}--${flagName})
        if [ ! $# -gt 1 ]; then
            echo "option requires an argument -- $key" >&2
            exit 1
        fi
        ${flagName}=$2
        shift
        shift
        ;;`;
    }
  }
  const loopEnd = `

        *)
        args+=("$key")
        shift
        ;;

    esac
done`;

  return prefilled + loopStart + loopBody + loopEnd;
});

console.log(newSource)
