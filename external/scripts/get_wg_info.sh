#!/bin/bash

# MUST BE RUN AS ROOT, requires ripgrep

ip=$(wg show | rg "endpoint: (\d+\.\d+\.\d+\.\d+)" -or '$1')

curl ipinfo.io/$ip
