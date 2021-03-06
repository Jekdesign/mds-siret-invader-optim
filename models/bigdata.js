const mongoose = require('mongoose')

const bigDataSchema = new mongoose.Schema({
  siren: String,
  nic: String,
  siret: String,
  statutdiffusionetablissement: String,
  datecreationetablissement: Date,
  trancheeffectifsetablissement: String,
  anneeeffectifsetablissement: Date,
  activiteprincipaleregistremetiersetablissement: String,
  to_char: Date,
  etablissementsiege: Boolean,
  nombreperiodesetablissement: String,
  complementadresseetablissement: String,
  numerovoieetablissement: String,
  indicerepetitionetablissement: String,
  typevoieetablissement: String,
  libellevoieetablissement: String,
  codepostaletablissement: String,
  libellecommuneetablissement: String,
  libellecommuneetrangeretablissement: String,
  distributionspecialeetablissement: String,
  codecommuneetablissement: String,
  codecedexetablissement: String,
  libellecedexetablissement: String,
  codepaysetrangeretablissement: String,
  libellepaysetrangeretablissement: String,
  complementadresse2etablissement: String,
  numerovoie2etablissement: String,
  indicerepetition2etablissement: String,
  typevoie2etablissement: String,
  libellevoie2etablissement: String,
  codepostal2etablissement: String,
  libellecommune2etablissement: String,
  libellecommuneetranger2etablissement: String,
  distributionspeciale2etablissement: String,
  codecommune2etablissement: String,
  codecedex2etablissement: String,
  libellecedex2etablissement: String,
  codepaysetranger2etablissement: String,
  libellepaysetranger2etablissement: String,
  datedebut: Date,
  etatadministratifetablissement: String,
  enseigne1etablissement: String,
  enseigne2etablissement: String,
  enseigne3etablissement: String,
  denominationusuelleetablissement: String,
  activiteprincipaleetablissement: String,
  nomenclatureactiviteprincipaleetablissement: String,
  caractereemployeuretablissement: String
})

const bigData = mongoose.model('bigData', bigDataSchema)

module.exports = bigData
