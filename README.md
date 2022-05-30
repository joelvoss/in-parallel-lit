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
$ in-parallel "ping google.com -c 3" "ping 127.0.0.1 -c 3"

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

## Options

### `-n, --names`

List of custom names to be used in prefix template.

```bash
$ in-parallel -n "google,localhost" "ping google.com -c 2" "ping 127.0.0.1 -c 2"

# Prints:
# -------
# [localhost] PING 127.0.0.1 (127.0.0.1): 56 data bytes
# [localhost] 64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.051 ms
# [google] PING google.com (142.250.186.46): 56 data bytes
# [google] 64 bytes from 142.250.186.46: icmp_seq=0 ttl=56 time=18.726 ms
# [localhost] 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.205 ms
# [localhost] 
# [localhost] --- 127.0.0.1 ping statistics ---
# [localhost] 2 packets transmitted, 2 packets received, 0.0% packet loss
# [localhost] round-trip min/avg/max/stddev = 0.051/0.128/0.205/0.077 ms
# [google] 64 bytes from 142.250.186.46: icmp_seq=1 ttl=56 time=18.386 ms
# [google] 
# [google] --- google.com ping statistics ---
# [google] 2 packets transmitted, 2 packets received, 0.0% packet loss
# [google] round-trip min/avg/max/stddev = 18.386/18.556/18.726/0.170 ms
```

### `-c, --continue-on-error`

Set the flag to continue executing other/subsequent tasks even if a task threw
an error. `in-parallel` itself will exit with non-zero code if one or more
tasks threw error(s).

```bash
$ in-parallel -c "<command that fails>" "ping 127.0.0.1 -c 2"

# Prints:
# -------
# [ping 127.0.0.1 -c 2] PING 127.0.0.1 (127.0.0.1): 56 data bytes
# [ping 127.0.0.1 -c 2] 64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.054 ms
# [ping 127.0.0.1 -c 2] 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.201 ms
# [ping 127.0.0.1 -c 2] 
# [ping 127.0.0.1 -c 2] --- 127.0.0.1 ping statistics ---
# [ping 127.0.0.1 -c 2] 2 packets transmitted, 2 packets received, 0.0% packet loss
# [ping 127.0.0.1 -c 2] round-trip min/avg/max/stddev = 0.054/0.128/0.201/0.074 ms
```

### `--max-parallel`

Set the maximum number of parallelism. Default is unlimited (`0`).

```bash
$ in-parallel --max-parallel 1 "ping google.com -c 2" "ping 127.0.0.1 -c 2"

# Prints:
# -------
# [ping google.com -c 2] PING google.com (142.250.186.46): 56 data bytes
# [ping google.com -c 2] 64 bytes from 142.250.186.46: icmp_seq=0 ttl=56 time=19.455 ms
# [ping google.com -c 2] 64 bytes from 142.250.186.46: icmp_seq=1 ttl=56 time=18.799 ms
# [ping google.com -c 2] 
# [ping google.com -c 2] --- google.com ping statistics ---
# [ping google.com -c 2] 2 packets transmitted, 2 packets received, 0.0% packet loss
# [ping google.com -c 2] round-trip min/avg/max/stddev = 18.799/19.127/19.455/0.328 ms
# [ping 127.0.0.1 -c 2] PING 127.0.0.1 (127.0.0.1): 56 data bytes
# [ping 127.0.0.1 -c 2] 64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.050 ms
# [ping 127.0.0.1 -c 2] 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.120 ms
# [ping 127.0.0.1 -c 2] 
# [ping 127.0.0.1 -c 2] --- 127.0.0.1 ping statistics ---
# [ping 127.0.0.1 -c 2] 2 packets transmitted, 2 packets received, 0.0% packet loss
# [ping 127.0.0.1 -c 2] round-trip min/avg/max/stddev = 0.050/0.085/0.120/0.035 ms
```

### `--aggregate-output`

Avoid interleaving output by delaying printing of each command's output until
it has finished.

```bash
$ in-parallel --aggregate-output "ping google.com -c 2" "ping 127.0.0.1 -c 2"

# Prints:
# -------
# [ping 127.0.0.1 -c 2] PING 127.0.0.1 (127.0.0.1): 56 data bytes
# [ping 127.0.0.1 -c 2] 64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.052 ms
# [ping 127.0.0.1 -c 2] 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.076 ms
# [ping 127.0.0.1 -c 2] 
# [ping 127.0.0.1 -c 2] --- 127.0.0.1 ping statistics ---
# [ping 127.0.0.1 -c 2] 2 packets transmitted, 2 packets received, 0.0% packet loss
# [ping 127.0.0.1 -c 2] round-trip min/avg/max/stddev = 0.052/0.064/0.076/0.012 ms
# [ping google.com -c 2] PING google.com (142.250.186.46): 56 data bytes
# [ping google.com -c 2] 64 bytes from 142.250.186.46: icmp_seq=0 ttl=56 time=18.493 ms
# [ping google.com -c 2] 64 bytes from 142.250.186.46: icmp_seq=1 ttl=56 time=18.072 ms
# [ping google.com -c 2] 
# [ping google.com -c 2] --- google.com ping statistics ---
# [ping google.com -c 2] 2 packets transmitted, 2 packets received, 0.0% packet loss
# [ping google.com -c 2] round-trip min/avg/max/stddev = 18.072/18.282/18.493/0.211 ms
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
