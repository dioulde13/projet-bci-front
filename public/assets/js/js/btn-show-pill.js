// Utilisation de JavaScript pour activer les tabs
document.getElementById('showDetailsDesPaiementsTab').addEventListener('click', function () {
    var DetailsDesPaiementsTab = new bootstrap.Tab(document.getElementById('v-pills-DetailsDesPaiements-tab'));
    DetailsDesPaiementsTab.show();
  });