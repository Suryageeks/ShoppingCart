const { json } = require("express");

class WhereClause{
    constructor(base, bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }
    search() {
        const searchword = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,  //this will take all words after search=
                $options:'i' //not mandatory
            }
        } : {}

        this.base = this.base.find({ ...searchword })
        return this;
    }

    pager(resultperPage) {
        let currentPage = 1
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }

        const skipVal = resultperPage * (currentPage - 1)
        //eg 5*(1-1)==>0

        this.base = this.base.limit(resultperPage).skip(skipVal)

        return this
    }

    filter(){
        const copyQ = { ...this.bigQ }
        delete copyQ["search"]
        delete copyQ["page"]
        delete copyQ["limit"]

        //convert bigQ to string in copyQ
        let stringofCopyQ = JSON.stringify(copyQ)

        stringofCopyQ = stringofCopyQ.replace(/\b(gte | lte | gt | lt)\b/g,m=>`$${m}`)

        const jsonofCopyQ = JSON.parse(stringofCopyQ)

        this.base = this.base.find(jsonofCopyQ)
        return this

    }
    
}

module.exports = WhereClause