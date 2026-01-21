// /* ==========================================================================
// Tables
// ========================================================================== */

// // Initialisation de DataTables avec vérification d'existence
// $(document).ready(function () {
//     var tables = $('.datatable');

//     // Vérification si des tableaux sont présents
//     if (tables.length === 0) {
//         console.warn("Aucun tableau trouvé avec la classe '.datatable'.");
//         return;
//     }

//     var table; // Déclare la variable pour l'instance de DataTable

//     try {
//         table = tables.DataTable({
//             responsive: false,
//             language: {
//                 sEmptyTable: "Aucune donnée disponible dans le tableau",
//                 sInfo: "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
//                 sInfoEmpty: "Affichage de l'élément 0 à 0 sur 0 élément",
//                 sInfoFiltered: "(filtré à partir de _MAX_ éléments au total)",
//                 sLengthMenu: "Afficher _MENU_ éléments",
//                 sLoadingRecords: "Chargement...",
//                 sProcessing: "Traitement...",
//                 sSearch: "Rechercher :",
//                 sZeroRecords: "Aucun élément correspondant trouvé",
//                 oPaginate: {
//                     sFirst: "Premier",
//                     sLast: "Dernier",
//                     sNext: "Suivant",
//                     sPrevious: "Précédent"
//                 },
//                 oAria: {
//                     sSortAscending: ": activer pour trier la colonne par ordre croissant",
//                     sSortDescending: ": activer pour trier la colonne par ordre décroissant"
//                 }
//             },

//             autoWidth: false  // Garde autoWidth désactivé

//         });
//     } catch (error) {
//         console.error("Erreur lors de l'initialisation de DataTables :", error);
//     }

//     // Barre de recherche personnalisée
//     $('.customSearchBox').keyup(function () {
//         if (table) {
//             table.search($(this).val()).draw();
//         }
//     });

//     // Menu déroulant personnalisé pour afficher le nombre de lignes
//     $('#customLength').change(function () {
//         if (table) {
//             table.page.len($(this).val()).draw();
//         }
//     });
// });

// // Afficher/masquer la valeur du mot de passe
// $("#password-addon").on('click', function () {
//     if ($(this).siblings('input').length > 0) {
//         $(this).siblings('input').attr('type') === "password" ? 
//             $(this).siblings('input').attr('type', 'text') : 
//             $(this).siblings('input').attr('type', 'password');
//     }
// });

// // Initialisation de flatpickr pour le sélecteur de date
// flatpickr('.datepicker-range', {
//     mode: "range",
//     altInput: true,
//     wrap: true,
//     locale: "fr",
//     defaultDate: new Date()
// });

// // Fonction pour basculer les cases à cocher
// function eventCheckBox() {
//     let checkboxes = document.querySelectorAll("input[type='checkbox']");
//     checkboxes.forEach(checkbox => {
//         checkbox.checked = !checkbox.checked;
//     });
// }

// /*
// ===================================================================================
// Fin du script
// ===================================================================================
// */




/* ==========================================================================
Tables
========================================================================== */
// Initialisation de DataTables avec vérification d'existence
$(document).ready(function () {
    var tables = $('.datatable');

    // Vérification si des tableaux sont présents
    if (tables.length === 0) {
        console.warn("Aucun tableau trouvé avec la classe '.datatable'.");
        return;
    }

    var table; // Déclare la variable pour l'instance de DataTable

    try {
        table = tables.DataTable({
            responsive: false,
            autoWidth: false, // Garde autoWidth désactivé
            
            // --- NOUVELLES FONCTIONNALITÉS ---
            ordering: true,   // Active le tri (flèches haut/bas sur les colonnes)
            paging: true,     // Active la pagination
            pagingType: "full_numbers", // Génère: << < 1 2 3 4 5 ... > >>
            pageLength: 10,   // Définit le nombre de lignes par défaut à 10

            language: {
                sEmptyTable: "Aucune donnée disponible dans le tableau",
                sInfo: "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
                sInfoEmpty: "Affichage de l'élément 0 à 0 sur 0 élément",
                sInfoFiltered: "(filtré à partir de _MAX_ éléments au total)",
                sLengthMenu: "Afficher _MENU_ éléments",
                sLoadingRecords: "Chargement...",
                sProcessing: "Traitement...",
                sSearch: "Rechercher :",
                sZeroRecords: "Aucun élément correspondant trouvé",
                oPaginate: {
                    sFirst: "<<",
                    sLast: ">>",
                    sNext: "Suivant",
                    sPrevious: "Précédent"
                },
                oAria: {
                    // Ces clés "s" minuscule au début (standard DataTables)
                    sSortAscending: ": activer pour trier la colonne par ordre croissant",
                    sSortDescending: ": activer pour trier la colonne par ordre décroissant"
                }
            }
        });
    } catch (error) {
        console.error("Erreur lors de l'initialisation de DataTables :", error);
    }

    // Barre de recherche personnalisée (liée à votre input HTML .customSearchBox)
    $('.customSearchBox').keyup(function () {
        if (table) {
            table.search($(this).val()).draw();
        }
    });

    // Menu déroulant personnalisé pour le nombre de lignes (lié à votre select HTML #customLength)
    $('#customLength').change(function () {
        if (table) {
            table.page.len($(this).val()).draw();
        }
    });
});




// Ma fonction pour initialisser le datable
function initMyDatatable() {
  var tables = $('.datatable');

  // Vérification si des tableaux sont présents
  if (tables.length === 0) {
    console.warn("Aucun tableau trouvé avec la classe '.datatable'.");
    return;
  }

  var table; // Déclare la variable pour l'instance de DataTable

  try {
    table = tables.DataTable({
      responsive: false,
      autoWidth: false, // Garde autoWidth désactivé

      // --- NOUVELLES FONCTIONNALITÉS ---
      ordering: true,   // Active le tri (flèches haut/bas sur les colonnes)
      paging: true,     // Active la pagination
      pagingType: "full_numbers", // Génère: << < 1 2 3 4 5 ... > >>
      pageLength: 10,   // Définit le nombre de lignes par défaut à 10

      language: {
        sEmptyTable: "Aucune donnée disponible dans le tableau",
        sInfo: "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
        sInfoEmpty: "Affichage de l'élément 0 à 0 sur 0 élément",
        sInfoFiltered: "(filtré à partir de _MAX_ éléments au total)",
        sLengthMenu: "Afficher _MENU_ éléments",
        sLoadingRecords: "Chargement...",
        sProcessing: "Traitement...",
        sSearch: "Rechercher :",
        sZeroRecords: "Aucun élément correspondant trouvé",
        oPaginate: {
          sFirst: "<<",
          sLast: ">>",
          sNext: "Suivant",
          sPrevious: "Précédent"
        },
        oAria: {
          // Ces clés "s" minuscule au début (standard DataTables)
          sSortAscending: ": activer pour trier la colonne par ordre croissant",
          sSortDescending: ": activer pour trier la colonne par ordre décroissant"
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de DataTables :", error);
  }

  // Barre de recherche personnalisée (liée à votre input HTML .customSearchBox)
  $('.customSearchBox').keyup(function () {
    if (table) {
      table.search($(this).val()).draw();
    }
  });

  // Menu déroulant personnalisé pour le nombre de lignes (lié à votre select HTML #customLength)
  $('#customLength').change(function () {
    if (table) {
      table.page.len($(this).val()).draw();
    }
  });
}

// Afficher/masquer la valeur du mot de passe
$("#password-addon").on('click', function () {
    if ($(this).siblings('input').length > 0) {
        $(this).siblings('input').attr('type') === "password" ? 
            $(this).siblings('input').attr('type', 'text') : 
            $(this).siblings('input').attr('type', 'password');
    }
});

// Initialisation de flatpickr pour le sélecteur de date
flatpickr('.datepicker-range', {
    mode: "range",
    altInput: true,
    wrap: true,
    locale: "fr",
    defaultDate: new Date()
});

// Fonction pour basculer les cases à cocher
function eventCheckBox() {
    let checkboxes = document.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.checked = !checkbox.checked;
    });
}

/*
===================================================================================
Fin du script
===================================================================================
*/
