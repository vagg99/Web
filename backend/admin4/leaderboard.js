// Διαχειριστής : 4) Απεικόνιση Leaderboard

const { getData } = require('../utils/connectToDB.js');

async function getLeaderboard() {
    const users = await getData('users');
    let leaderboard = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].points && users[i].tokens) {
        leaderboard.push({
          username: users[i].username,
          // Αν το τρεχον σκορ (μηνιαιο) του χρηστη ειναι αρνητικο , 
          // δειξε στο leaderboard μονο το συνολικο (παλιο) score.
          // Αν ειναι θετικο , δειξε στο leaderboard το αθροισμα του μηνιαιου και του συνολικου
          points :
            (users[i].points["monthly"] >= 0) ? users[i].points["total"] + users[i].points["monthly"] : users[i].points["total"]
          ,
          tokens: users[i].tokens
        });
      }
    }
    leaderboard.sort((a,b) => b.points - a.points);
    return leaderboard;
}

module.exports = { getLeaderboard };