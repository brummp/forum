"use strict";
/**
 ** Forum Module
 **
 ** @version 0.0.1
 **
 */

var forum = module.exports;

var url = "mongodb://localhost:27017/",
    database = "ISInformationPlatform",
    base_postlist_collection = "postlist",
    base_postdetail_collection = "postdetail",
    base_postcomment_collection = "postcomment";

var mongo = require('kqudie')(url);

/**
 ** getCurrentTime
 **
 ** @return unix timestamp
 **
 */

function getCurrentTime(){
  return Math.round(new Date().getTime()/1000);
}

/**
 ** getAllPost
 **
 ** @param section_id section id
 ** @param callback
 **
 */

forum.getAllPost = async function (section_id) {
  var postlist_section_collection = base_postlist_collection + "_" + section_id;

  try {
    return await mongo.find(database, postlist_section_collection, {});
  } catch (error) {
    throw error;
  }
}

/**
 ** getPostDetail
 **
 ** @param section_id section id
 ** @param post_id post id (string)
 ** @param callback
 **
 */

forum.getPostDetail = async function (section_id, post_id) {
  var postlist_section_collection = base_postlist_collection + "_" + section_id;
  var findObj = {
    "_id": mongo.String2ObjectId(post_id)
  };

  return await mongo.find(database, postlist_section_collection, {
    find: findObj, sort: {}
  });
}

/**
 ** submitPost
 **
 ** @param section_id section id
 ** @param data post data
 ** @param callback
 **
 */

forum.submitPost = async function(section_id, data){
  var postdetail_section_collection = base_postdetail_collection + "_" + section_id;
  var postlist_section_collection = base_postlist_collection + "_" + section_id;

  var new_ObjectId = mongo.String2ObjectId();

  var insertListObj = {
    "_id" : new_ObjectId,
    "post_title" : data.post_title,
    "tag" : data.tag,
    "post_author" : data.post_author,
    "post_content" : data.post_content,
    "reply_count" : 0,
    "visited" : 0,
    "last_comment" : "null",
    "last_comment_time" : 0
  };
  /*var insertDetailObj = {
    "_id" : new_ObjectId,
    "post_title" : data.post_title,
    "tag" : data.tag,
    "post_content" : data.post_content,
    "post_author" : data.post_author,
    "reply_count" : 0,
    "visited" : 0
  };*/

  return await mongo.insert(database, postlist_section_collection, insertListObj);
}

/**
 ** updatePostDetail
 **
 ** @param section_id section id
 ** @param post_id post id (string)
 ** @param data json data
 ** @param callback
 **
 */

forum.updatePostDetail = async function(section_id, post_id, data){
  var postdetail_section_collection = base_postdetail_collection + "_" + section_id;
  var query = {
    "_id" : mongo.String2ObjectId(post_id)
  };
  var option = {
    "upsert" : false,
    "multi" : false
  };
  var updateObj = {
    $set : {
      "post_title" : data.post_title,
      "post_content" : data.post_content,
      "tag" : data.tag,
      "post_time" : getCurrentTime()
    }
  };
  mongo.update(database, postdetail_section_collection, query, updateObj, option, function(err, result){
    if(err) throw err;
    console.log(result.result.n);
    return result.result.n;
  });
}

/**
 ** toggleVisitIncrease
 **
 ** @param section_id section id
 ** @param post_id post id (string)
 ** @param callback
 **
 */

forum.toggleVisitIncrease = async function(section_id, post_id){
  var postdetail_section_collection = base_postdetail_collection + "_" + section_id;
  var postlist_section_collection = base_postlist_collection + "_" + section_id;
  var query = {
    "_id" : mongo.String2ObjectId(post_id)
  };
  var updateObj = {
    $inc : {
      "visited" : 1
    }
  };
  try {
    await mongo.update(database, postdetail_section_collection, query, updateObj);
  } catch (error) {
    throw error;
  }
  try {
    await mongo.update(database, postlist_section_collection, query, updateObj);
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 ** toggleReplyIncrease
 **
 ** @param section_id section id
 ** @param post_id post id (string)
 ** @param callback
 **
 */

forum.toggleReplyIncrease = async function(section_id, post_id){
  var postdetail_section_collection = base_postdetail_collection + "_" + section_id;
  var postlist_section_collection = base_postlist_collection + "_" + section_id;
  var query = {
    "_id" : mongo.String2ObjectId(post_id)
  };
  var updateObj = {
    $inc : {
      "reply_count" : 1
    }
  };

  try {
    await mongo.update(database, postdetail_section_collection, query, updateObj);
  } catch (error) {
    throw error;
  }
  try {
    await mongo.update(database, postlist_section_collection, query, updateObj);
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 ** getAllComment
 **
 ** @param section_id section id
 ** @param post_id post id (string)
 ** @param callback
 **
 */

forum.getAllComment = async function(section_id, post_id){
  var commentlist_section_collection = base_postcomment_collection + "_" + section_id;
  var findObj = {
    "post_id" : post_id
  };
  mongo.find(database, commentlist_section_collection, findObj, function(err, result){
    if(err) throw err;
    return result;
  });
}

/**
 ** submitComment
 **
 ** @param section_id section id
 ** @param post_id post id (string)
 ** @param data comment data
 **
 **
 */

forum.submitComment = async function (section_id, post_id, data) {
  var commentlist_section_collection = base_postcomment_collection + "_" + section_id;
  var postlist_section_collection = base_postlist_collection + "_" + section_id;
  forum.toggleReplyIncrease(section_id, post_id, function (err, result) {
    if (err) throw (err);
  });
  var query = {
    "_id": mongo.String2ObjectId(post_id)
  };
  var option = {
    "upsert": false,
    "multi": false
  };
  var updateObj = {
    $set: {
      "last_comment": data.comment_author,
      "last_comment_time": getCurrentTime()
    }
  };
  mongo.update(database, postlist_section_collection, query, updateObj, option, function (err, result) {
    if (err) throw (err);
  });
  var insertObj = {
    "post_id": post_id,
    "comment_author": data.comment_author,
    "comment_content": data.comment_content,
    "reply_to_comment_id": data.reply_to_comment_id
  };
  try {
    let result = await mongo.insert(database, commentlist_section_collection, insertObj);
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 ** updateComment
 **
 ** @param section_id section id
 ** @param post_id post id (string)
 ** @param comment_id comment id
 ** @param data comment data
 ** @param callback
 **
 */

forum.updateComment = function(section_id, post_id, comment_id, data, callback){
  var commentlist_section_collection = base_postcomment_collection + "_" + section_id;
  var postlist_section_collection = base_postlist_collection + "_" + section_id;
  var list_query = {
    "_id" : mongo.String2ObjectId(post_id)
  };
  var option = {
    "upsert" : false,
    "multi" : false
  };
  var update_list_obj = {
    $set : {
      "last_comment" : data.comment_author,
      "last_comment_time" : getCurrentTime()
    }
  };
  mongo.update(database, postlist_section_collection, list_query, update_list_obj, option, function(err, result){
    if(err) callback(err);
  });
  var comment_query = {
    "_id" : mongo.String2ObjectId(comment_id)
  };
  var update_comment_obj = {
    "post_id" : post_id,
    "comment_author" : data.comment_author,
    "comment_content" : data.comment_content,
    "reply_to_comment_id" : data.reply_to_comment_id
  };
  mongo.update(database, commentlist_section_collection, comment_query, update_comment_obj, option, function(err, result){
    if(err) callback(err);
    console.log(result.result.n);
    callback(null, result.result.n);
  });
}
