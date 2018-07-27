var forum = require('../src');
var expect = require('chai').expect;

const url = "mongodb://localhost:27017/";
const MongoClient = require('mongodb').MongoClient;
const mongo = require('kqudie')(url);

const DATABASE = "ISInformationPlatform";
const COMMENT_COLLECTION = "postcomment_1";
const POST_COLLECTION = "postlist_1";

describe('toggleReplyIncrease',function(){
    before(async function () {
        try {
            let connect = await getConnect();

            let db = connect.db(DATABASE);
            let post_collect = db.collection(POST_COLLECTION);

            await post_collect.deleteMany({});
            await post_collect.insertMany([
                { a: 1 }, { a: 2 }, { a: 3 }
            ]);

            let comment_collect = db.collection(COMMENT_COLLECTION);
            await comment_collect.deleteMany({});

            connect.close();
        } catch (err) {
            throw err;
        }
    });
    it('test', async function () {
        let post_id = await forum.getAllPost(1);
        await forum.toggleReplyIncrease(1, post_id[0]['_id']);

        let connect = await getConnect();

        let db = connect.db(DATABASE);
        let post_collect = db.collection(POST_COLLECTION);
        var result = await post_collect.find({}).sort({}).toArray();

        expect(result).to.have.lengthOf(3);
        expect(result[0].reply_count).to.equal(1);
    });
});

async function getConnect() {
    try {
        let connect = await MongoClient.connect(url);
        return connect;
    } catch (err) {
        throw err;
    }
}