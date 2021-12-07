# Usage

<!-- usage -->
```sh-session
$ npm install -g @airpaas/cli
$ air COMMAND
running command...
$ air (-v|--version|version)
@airpaas/cli/0.1.0 darwin-x64 node-v16.13.1
$ air --help [COMMAND]
USAGE
  $ air COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`air component OPERATION`](#air-component-operation)
* [`air config [KEY] [VALUE]`](#air-config-key-value)
* [`air help [COMMAND]`](#air-help-command)
* [`air lib [MODE]`](#air-lib-mode)

## `air component OPERATION`

组件操作

```
USAGE
  $ air component OPERATION
```

_See code: [src/commands/component.js](https://github.com/airpaas/cli/blob/v0.1.0/src/commands/component.js)_

## `air config [KEY] [VALUE]`

配置账号信息

```
USAGE
  $ air config [KEY] [VALUE]
```

_See code: [src/commands/config.js](https://github.com/airpaas/cli/blob/v0.1.0/src/commands/config.js)_

## `air help [COMMAND]`

display help for air

```
USAGE
  $ air help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.7/src/commands/help.ts)_

## `air lib [MODE]`

组件库操作

```
USAGE
  $ air lib [MODE]
```

_See code: [src/commands/lib.js](https://github.com/airpaas/cli/blob/v0.1.0/src/commands/lib.js)_
<!-- commandsstop -->
