bash-args-compiler
===

## Usage

```bash
node compile.js template.sh > result.sh
```

A template file needs to have it's flags area demilited by:


```
<<"FLAGS"
FLAGS
```

A flag line takes the following format. Note that a boolean flag ends
with an `!` and that the shortname is optional:

```
foo=f
boolean_with_no_short_name!
another_bool=b!
```

Here's an example input:

```bash
#!/usr/bin/env bash

set -euo pipefail

<<"FLAGS"
extension=e
boolean=b!
another_boolean!
FLAGS

echo "extension is $extension"
echo "boolean is $boolean"
echo "another_boolean is $another_boolean"
if [ "${args-}" != "" ]; then
    for arg in "${args[@]}"; do
        echo "arg is $arg ok"
    done
fi

echo test
```

Here's the output of that:

```bash
#!/usr/bin/env bash

set -euo pipefail

args=()
extension=
boolean=
another_boolean=
while [[ $# -gt 0 ]]; do
    key=$1
    case $key in

        -e=*|--extension=*)
        extension="${key#*=}"
        shift
        ;;

        -e|--extension)
        if [ ! $# -gt 1 ]; then
            echo "option requires an argument -- $key" >&2
            exit 1
        fi
        extension=$2
        shift
        shift
        ;;

        -b|--boolean)
        boolean=1
        shift
        ;;

        --another_boolean)
        another_boolean=1
        shift
        ;;

        *)
        args+=("$key")
        shift
        ;;

    esac
done

echo "extension is $extension"
echo "boolean is $boolean"
echo "another_boolean is $another_boolean"
if [ "${args-}" != "" ]; then
    for arg in "${args[@]}"; do
        echo "arg is $arg ok"
    done
fi

echo test
```