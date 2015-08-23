'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  Q = require('q'),
  uuid = require('uuid');

var oauthState = require('./lib-oauth-state');

describe('Oauth', function () {

  describe('State', function () {

    afterEach(function () {
      if (Q.ninvoke.restore) {
        Q.ninvoke.restore();
      }
    });

    describe('bucket upsert', function () {

      it('should save OK', function (done) {

        should.exist(oauthState);

        var documentName = uuid.v4();

        oauthState.upsert(documentName).then(function (res) {
          res.constructor.name.should.equal('CouchbaseCas');
          res.toString().should.match(/^[0-9]+$/);
        })
          .then(done, done);

      });

      it('should handle errors', function (done) {

        sinon.stub(Q, 'ninvoke', function () {
          return Q.resolve('I am not a Couchbase object with a cas property');
        });

        oauthState.upsert('test_doc', {name: 'Alice'}).catch(function (err) {
          err.toString().should.equal('Error: Bucket Upsert Failed.');
        })
          .then(done, done);

      });

    });

    describe('bucket get', function () {

      var documentName = uuid.v4();

      it('should return a document', function (done) {

        oauthState.upsert(documentName)
          .then(function () {
            return oauthState.get(documentName);
          })
          .then(function (res) {
            res.created_at.should.match(/^[0-9]+$/);
            res.expires_at.should.match(/^[0-9]+$/);
          })
          .then(done, done);

      });

      it('should handle errors', function (done) {

        sinon.stub(Q, 'ninvoke', function () {
          return Q.resolve('I am not a Couchbase object with a cas property');
        });

        oauthState.get('test_doc').catch(function (err) {
          err.toString().should.equal('Error: Bucket Get Failed.');
        })
          .then(done, done);

      });

      it('should handle 404 documents', function(done) {

        oauthState.get('404_document').catch(function(err) {
          err.message.should.equal('The key does not exist on the server');
          err.code.should.equal(13);
        })
        .then(done, done);

      });

    });

    describe('bucket remove', function () {

      var documentName = uuid.v4();

      it('should remove a document', function (done) {

        oauthState.upsert(documentName)
          .then(function () {
            return oauthState.remove(documentName);
          })
          .then(function (res) {
            res.constructor.name.should.equal('CouchbaseCas');
            res.toString().should.match(/^[0-9]+$/);
          })
          .then(done, done);

      });

      it('should handle errors', function (done) {

        sinon.stub(Q, 'ninvoke', function () {
          return Q.resolve('I am not a Couchbase object with a cas property');
        });

        oauthState.remove('test_doc').catch(function (err) {
          err.toString().should.equal('Error: Bucket Remove Failed.');
        })
          .then(done, done);

      });

      it('should handle 404 documents', function(done) {

        oauthState.remove('404_document').catch(function(err) {
          err.message.should.equal('The key does not exist on the server');
          err.code.should.equal(13);
        })
          .then(done, done);

      });

    });

    describe('state is_valid', function() {

      it('should return true for non-expired state objects', function(done) {

        var timeNow = Date.now();
        var documentValue = {
          created_at: timeNow,
          expires_at: timeNow + (120 * 1000)
        };

        oauthState.isValid(documentValue).then(function(res) {
          res.should.match(/valid/i);
        })
        .then(done, done);

      });

      it('should return false for expired state objects', function() {

        var timeNow = Date.now() - (125 * 1000);

        var documentValue = {
          created_at: timeNow,
          expires_at: timeNow + (120 * 1000)
        };

        oauthState.isValid(documentValue).catch(function(err) {
          err.should.match(/expired/i);
        });

      });

    });

  });

});

