# in-parallel-lit

A CLI tool to run multiple processes in parallel.

## Requirements

- [Node v16+][install-node]

## Installation

```bash
$ npm i -g in-parallel-lit
# or
$ yarn global add in-parallel-lit
```

## Usage

```bash
$ npx in-parallel "ping google.com -c 3" "ping 127.0.0.1 -c 3"

# Prints:
# -------
# [ping 127.0.0.1 -c 3] PING 127.0.0.1 (127.0.0.1): 56 data bytes
# [ping 127.0.0.1 -c 3] 64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.044 ms
# [ping google.com -c 3] PING google.com (142.250.181.238): 56 data bytes
# [ping google.com -c 3] 64 bytes from 142.250.181.238: icmp_seq=0 ttl=56 time=30.401 ms
# [ping 127.0.0.1 -c 3] 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.037 ms
# [ping google.com -c 3] 64 bytes from 142.250.181.238: icmp_seq=1 ttl=56 time=50.207 ms
# [ping 127.0.0.1 -c 3] 64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.188 ms
# [ping 127.0.0.1 -c 3] 
# [ping 127.0.0.1 -c 3] --- 127.0.0.1 ping statistics ---
# [ping 127.0.0.1 -c 3] 3 packets transmitted, 3 packets received, 0.0% packet loss
# [ping 127.0.0.1 -c 3] round-trip min/avg/max/stddev = 0.037/0.090/0.188/0.070 ms
# [ping google.com -c 3] 64 bytes from 142.250.181.238: icmp_seq=2 ttl=56 time=29.115 ms
# [ping google.com -c 3] 
# [ping google.com -c 3] --- google.com ping statistics ---
# [ping google.com -c 3] 3 packets transmitted, 3 packets received, 0.0% packet loss
# [ping google.com -c 3] round-trip min/avg/max/stddev = 29.115/36.574/50.207/9.654 ms
```

## Development

(1) Install dependencies

```bash
$ npm i
# or
$ yarn
```

(2) Run initial validation

```bash
$ ./Taskfile.sh validate
```

(3) Start developing. See [`./Taskfile.sh`](./Taskfile.sh) for more tasks to
    help you develop.

---

_This project was set up by @jvdx/core_

[install-node]: https://github.com/nvm-sh/nvm
