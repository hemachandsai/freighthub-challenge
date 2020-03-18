const { spawn } = require("child_process");
const fs = require("fs");
const net = require('net');
const path = require('path');
const pids = []

async function setupAndServeProject() {
    if (!checkDirectory()) {
        return
    }
    await installBackendDependencies().catch(e => console.log(e));
    await installUIDependencies().catch(e => console.log(e));
    await checkAngularCLI().catch(e => console.log(e));
    startProject().catch(e => console.log(e));
}

setupAndServeProject();

process.on("SIGINT", () => {
    console.log("Received SIGINT to halt process. If any errors while setting up the project please follow the instructions from README file")
    pids.map((pid) => {
        process.kill(pid,"SIGTERM")
        console.log(pid)
    })
    process.exit();
})
process.on('exit', function () {

})

function checkDirectory() {
    if (!process.cwd().match(/freighthub-frontend-challenge/gi)) {
        console.log(`Current directory is ${__dirname}. Please run this script after navigating to freighthub-frontend-challenge directory.`)
        return false
    }
    return true
}

function checkAngularCLI() {
    return new Promise((resolve, reject) => {
        const command = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["list", "-global", "--depth", "0"]);
        command.stdout.on('data', (data) => {
            data = Buffer.from(data).toString("utf8")
            const cliExists = data.match(/angular\/cli/gi)
            if (cliExists) {
                try {
                    let version = data.match(/angular\/cli@\d/gi)[0].match(/\d/)[0]
                    console.log(`Angular CLI installtion exists with version: ${version}. ${Number(version) < 9 ? "If any issues while running the project try upgrading CLI to latest version" : ""}`)
                } catch (e) {
                    console.log("Error while trying to get angular cli version. Proceeding with other steps")
                }
                resolve("success")
            } else {
                installAngularCLI((response) => {
                    if (response === "failed") {
                        reject(response)
                    } else {
                        resolve(response)
                    }
                })
            }
        });
        command.stderr.on('error', (err) => {
            console.log(`Error while executing command to check angular-cli version:\r\n${err}`);
        });
        command.on('close', (code) => {
            if (code == 0) {
                //do nothing   
            } else {
                console.log(`Error while executing command to check angular-cli version. Please install it yourself`);
            }
        });
    })
}

function printToConsole(){
    let i = 0;
    let timer = setInterval(() => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        i = (i + 1) % 6;
        var dots = new Array(i + 1).join(".");
        process.stdout.write("Installation Under Progress. Please wait " + dots); 
    }, 1000)
    return timer 
}

function installAngularCLI(callback) {
    const command = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["install", "-g", "@angular/cli"]);
    timer = printToConsole()
    console.log("Trying to install angular cli. Please wait till the installation completes.")
    command.stdout.on('data', (data) => {
        console.log(Buffer.from(data).toLocaleString('utf8'));

    });
    command.stderr.on('error', (err) => {
        callback("failed");
        console.log(`Error while executing trying to install  angular-cli :\r\n${err}`);
    });
    command.on('close', (code) => {
        clearInterval(timer)
        if (code == 0) {
            callback("success");
        } else {
            callback("failed");
            console.log(`Error while trying to install angular-cli. Please install it yourself`);
        }
    });
}

function installBackendDependencies() {
    return new Promise((resolve, reject) => {
        let folders = fs.readdirSync("./");
        let nodeModulesFound;
        folders.map((folder) => {
            if (folder.match(/node_modules/gi)) {
                nodeModulesFound = true;
            }
        })
        if (nodeModulesFound) {
            console.log("Already found a node_modules installation in backend server. Skipping dependency installation");
            resolve("success")
        } else {
            console.log("Trying to install backend dependencies. Please wait till the installation completes.");
            timer = printToConsole()
            const command = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["install"]);
            command.stdout.on('data', (data) => {
                console.log(Buffer.from(data).toLocaleString('utf8'));
            })
            command.stderr.on('error', (err) => {
                console.log(`Error while executing command to install backend dependencies:\r\n${err}`);
                reject("error")
            });
            command.on('close', (code) => {
                clearInterval(timer)
                if (code == 0) {
                    console.log("Successfully installed backend dependecnies");
                    resolve("success")
                } else {
                    console.log(`Error while executing command to install backend dependencies. Please install them yourself`);
                    reject("error")
                }
            });
        }
    })
}

function installUIDependencies() {
    return new Promise((resolve, reject) => {
        let folders = fs.readdirSync("./frontend-project");
        let nodeModulesFound;
        folders.map((folder) => {
            if (folder.match(/node_modules/gi)) {
                nodeModulesFound = true;
            }
        })
        if (nodeModulesFound) {
            console.log("Already found a node_modules installation in frontend fodler. Skipping dependency installation");
            resolve("success")
        } else {
            console.log("Trying to install frontend dependencies. Please wait till the installation completes, this might take some time...");
            timer = printToConsole()
            const command = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["install"], {
                cwd: path.resolve(__dirname, 'frontend-project')
            });
            command.stdout.on('data', (data) => {
                console.log(Buffer.from(data).toLocaleString('utf8'));

            })
            command.stderr.on('error', (err) => {
                console.log(`Error while executing command to install frontend dependencies:\r\n${err}`);
                reject("error")
            });
            command.on('close', (code) => {
                clearInterval(timer)
                if (code == 0) {
                    console.log("Successfully installed frontend dependecnies");
                    resolve("success")
                } else {
                    console.log(`Error while executing command to install frontend dependencies. Please install them yourself`);
                    reject("error")
                }
            });
        }
    })
}

function checkPort(port) {
    return new Promise((resolve) => {
        var server = net.createServer(function (socket) {
            socket.write('Echo server\r\n');
            socket.pipe(socket);
        });
    
        server.listen(port, '127.0.0.1');
        server.on('error', function (e) {
            resolve(true);
        });
        server.on('listening', function (e) {
            server.close();
            resolve(false);
        });
    })
}

async function startProject() {
    let port1 = await checkPort(4200)
    let port2 = await checkPort(3001)
    if (port1) {
        console.log("Port 4200 is not free and is require to serve UI files. Please freeup the port.")
        return
    }
    if (port2) {
        console.log("Port 3001 is not free and is require to start json server. Please freeup the port.")
        return
    }
    console.log("Trying to start front and backend servers. Please wait.");
    const command1 = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["run", "server"], {
        detached: true,
        stdio: [ 'ignore']
    })
    console.log(command1.pid);
    command1.stdout.on('data', (data) => {
        console.log(Buffer.from(data).toLocaleString('utf8'));
    })
    command1.stderr.on('error', (err) => {
        console.log(`Error while executing command to start json server:\r\n${err}`);
        reject("error")
    });
    command1.on('close', (code) => {
        console.log(code)
        console.log("Backend server stopped");
    });
    pids.push(command1.pid)
    const command2 = spawn(/^win/.test(process.platform) ? 'ng.cmd' : 'ng', ["serve"], {
        detached: true,
        cwd: path.resolve(__dirname, 'frontend-project'),
        stdio: [ 'ignore']
    })
    command2.stdout.on('data', (data) => {
        console.log(Buffer.from(data).toLocaleString('utf8'));

    })
    command2.stderr.on('error', (err) => {
        console.log(`Error while executing command to start UI server:\r\n${err}`);
        reject("error")
    });
    command2.on('close', (code) => {
        console.log("Frontend server stopped");
    });
    pids.push(command2.pid)
}