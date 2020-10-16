const beeline = require('honeycomb-beeline');

module.exports = function ({ name, image }) {
  const members = new Map()
  let chatHistory = []

  function broadcastMessage(message) {
    beeline.withSpan({
      name: 'broadcastMessage',
      entry: message
    }, () => { members.forEach(m => m.emit('message', message)) }
    )
  }

  function addEntry(entry) {
    beeline.withSpan({
      name: 'addEntry',
      entry: entry
    }, () => { chatHistory = chatHistory.concat(entry) }
    )
  }

  function getChatHistory() {
    return chatHistory.slice()
  }

  function addUser(client) {
    members.set(client.id, client)
  }

  function removeUser(client) {
    members.delete(client.id)
  }

  function serialize() {
    return {
      name,
      image,
      numMembers: members.size
    }
  }

  return {
    broadcastMessage,
    addEntry,
    getChatHistory,
    addUser,
    removeUser,
    serialize
  }
}
