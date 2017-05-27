# AntPost


### Quick start
**Make sure you have Node version >= 6.0 and NPM >= 3**

```bash
# clone our repo
git clone https://github.com/antpost/antpost-proxy.git

# change directory to our repo
cd antpost-proxy

# install the repo with npm
npm install

# start the server
node app.js

```

**Create executable file**

```bash
#First, install nexe
npm install nexe -g

#Compile time! This takes a while.
nexe -i app.js -o bin/antpost-proxy.exe

#Run your bundle
bin/antpost-proxy.exe

```

**Run as windows service**

Run file run.bat as administrator

Test: Open browser and go to http//localhost:3001