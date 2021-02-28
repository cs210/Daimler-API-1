
const profilesList = [
  {name: "Harold", age:"65", occupation: "Internet meme"},
  {name: "Barbara", age:"24", occupation: "Designer"},
  {name: "James", age:"25", occupation: "MD Student"},
  {name: "John", age:"23", occupation: "Engineer"},
  {name: "Linda", age:"23", occupation: "Software engineer"},
  {name: "Liz", age:"25", occupation: "Photographer"},
  {name: "Mary", age:"24", occupation: "High school teacher"},
  {name: "Michael", age:"27", occupation: "Freelancer"},
  {name: "Patricia", age:"26", occupation: "Engineer"},
  {name: "Robert", age:"30", occupation: "Physician"},
]

const profiles = {
  harold: profilesList[0],
  barbara: profilesList[1],
  james: profilesList[2],
  john: profilesList[3],
  linda: profilesList[4],
  liz: profilesList[5],
  mary: profilesList[6],
  michael: profilesList[7],
  patricia: profilesList[8],
  robert: profilesList[9],

  random: () => {
    return profilesList[Math.floor(Math.random() * 10)]
  }

}

export default profiles
