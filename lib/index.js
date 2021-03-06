/**
 * @author [siwilizhao]
 * @email [siwilizhao@gmail.com]
 * @create date 2019-02-22 17:17:16
 * @modify date 2019-02-22 17:17:16
 * @desc [siwi-file.js file download for nodejs]
 */
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const mkdir = require('siwi-mkdirs')
const ProgressBar = require('progress')

const SiwiFile  = {

    /**
     * @description download file for nodejs
     * @author siwilizhao@gmail.com
     * @date 2019-04-04
     * @param {*} url
     * @param {*} savepath
     * @returns Promise
     */
    async file(url, savepath) {
        return new Promise(async (resolve, reject) => {

            const dirname = path.dirname(savepath)
            if (!fs.existsSync(dirname)) {
                await mkdir.multi(dirname)
            }
            const {
                host,
                hostname,
                protocol,
                pathname,
            } = new URL(url)

            const options = {
                host: host,
                hostname: hostname,
                path: `${pathname}`,
                method: 'GET',
            }
            const r = protocol == 'http:' ? http : https
            const req = r.request(options, (res) => {
                const {
                    statusCode,
                    statusMessage
                } = res
                const total = res.headers["content-length"]
                if (statusCode !== 200) {
                    res.resume()
                    reject(new Error(`statusCode: ${statusCode} statusMessage: ${statusMessage}`))
                }
                const bar = new ProgressBar('[:bar] 速率 :rate/bps :current/:total 进度 :percent 剩余 :etas ', {
                    complete: '#',
                    incomplete: '-',
                    width: 100,
                    total: Number(total)
                })
                res.setEncoding('binary')
                const defaults = {
                    flags: "w",
                    encoding: "binary",
                    fd: null,
                    mode: 0o666,
                    autoClose: true
                };
                const stream = fs.createWriteStream(savepath, defaults)
                res.on('data', chunk => {
                    stream.write(chunk)
                    if(!bar.complete) {
                        bar.tick(chunk.length)
                    }
                })
                res.on('error', err => {
                    console.trace(err)
                    res.resume()
                    reject(false)
                })
                res.on('end', () => {
                    resolve(true)
                })
            })
            req.end()
        }).catch(error => {
            console.trace(error)
            return false
        })
    },
    /**
     * @description check is file or not by http response headers 
     * @author siwilizhao@gmail.com
     * @date 2019-04-04
     * @param {*} url
     * @returns Promise
     */
    async checkFile(url) {
        return new Promise((resolve, reject) => {
            const {
                protocol,
            } = new URL(url)

            const r = protocol == 'http:' ? http : https
            const req = r.request(url, (res) => {
                const {
                    statusCode,
                    statusMessage
                } = res
                if (statusCode !== 200) {
                    res.resume()
                    reject(new Error(`statusCode: ${statusCode} statusMessage: ${statusMessage}`))
                }                
                res.on('error', err => {
                    res.resume()
                    reject(false)
                })
                resolve(res.headers)
            })
            req.end()
        }).catch(error => {
            console.trace(error)
            return false
        })
    }
}

module.exports = SiwiFile