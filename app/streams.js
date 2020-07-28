module.exports = function() {
  
  var streamList = [];

  
  var Stream = function(id, name) {
    this.name = name;
    this.id = id;
  }

  return {
    addStream : function(id, name) {
      var stream = new Stream(id, name);
      streamList.push(stream);
    },

    removeStream : function(id) {
      var index = 0;
      while(index < streamList.length && streamList[index].id != id){
        index++;
      }
      streamList.splice(index, 1);
    },

    update : function(id, name) {
      var stream = streamList.find(function(element, i, array) {
        return element.id == id;
      });
      stream.name = name;
    },

    getStreams : function() {
      return streamList;
    }
  }
};
