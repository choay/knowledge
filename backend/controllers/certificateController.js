const { Certificate } = require('../models');

exports.getCertificatById = async (req, res) => {
  try {
    const certificat = await Certificate.findByPk(req.params.id);
    if (!certificat) return res.status(404).json({ message: 'Certificat non trouvé' });
    res.json(certificat);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.createCertificat = async (req, res) => {
  try {
    const certificat = await Certificate.create(req.body);
    res.status(201).json(certificat);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.updateCertificat = async (req, res) => {
  try {
    const [updated] = await Certificate.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCertificat = await Certificate.findByPk(req.params.id);
      return res.status(200).json(updatedCertificat);
    }
    throw new Error('Certificat non trouvé');
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.deleteCertificat = async (req, res) => {
  try {
    const deleted = await Certificate.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) return res.status(404).json({ message: 'Certificat non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
