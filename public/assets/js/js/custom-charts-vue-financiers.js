/* ==========================================================================
Custom Charts - apexcharts
========================================================================== */

// Fonction pour formater les nombres avec des séparateurs de milliers
function formatNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener("DOMContentLoaded", function () {
    const chartDom = document.getElementById('financeChart');

    // Vérifier que l'élément existe avant d'initialiser le graphique
    if (!chartDom) {
        console.warn("L'élément #financeChart est introuvable. Le graphique ne peut pas être affiché.");
        return;
    }

    try {
        const myChart = echarts.init(chartDom);
        let currentLevel = 'overview';

        // Options du graphique initial
        const baseOption = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    const formattedValue = formatNumberWithCommas(params.value);
                    return `${params.name} <br /> ${formattedValue} GNF<br />${params.percent} %`;
                },
                position: function (point) {
                    return [point[0], point[1] - 10];
                }
            },
            series: [
                {
                    name: 'Vue d\'ensemble',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    data: [
                        { value: 247200000, name: 'Actifs', itemStyle: { color: '#FFA500' } },
                        { value: 150000000, name: 'Passifs', itemStyle: { color: '#FF6347' } },
                        { value: 247200000, name: 'Valeur nette', itemStyle: { color: '#008000' } }
                    ],
                    label: { show: false },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        myChart.setOption(baseOption);

        // Gestion des clics sur le graphique
        myChart.on('click', function (params) {
            if (currentLevel === 'overview') {
                if (params.name === 'Actifs') {
                    showActifsDetails();
                } else if (params.name === 'Passifs') {
                    showPassifsDetails();
                } else if (params.name === 'Valeur nette') {
                    showValeurNetteDetails();
                }
            } else if (['actifs', 'passifs', 'valeurNette'].includes(currentLevel)) {
                navigateToSubCategory(params.name, currentLevel);
            }
        });

        // Fonctions pour mettre à jour le graphique et les entêtes
        function updateHeader(level, links) {
            const breadcrumb = document.getElementById('financeBreadcrumb');
            breadcrumb.innerHTML = links ? links.join(' > ') : '';
            breadcrumb.style.display = links ? 'block' : 'none';
            currentLevel = level;
        }

        function showActifsDetails() {
            updateHeader('actifs', [
                '<a href="javascript:void(0);" class="link-light" onclick="goToOverview()">Vue d\'ensemble</a>',
                'Actifs'
            ]);
            updateChartData('Actifs', [
                { value: 12000000, name: 'Comptes courants et épargnes', itemStyle: { color: '#FFD700' } },
                { value: 6000000, name: 'Dépôts à terme', itemStyle: { color: '#1E90FF' } },
                { value: 8000000, name: 'Prêts et financements', itemStyle: { color: '#32CD32' } },
                { value: 3800000, name: 'Investissements', itemStyle: { color: '#FF8C00' } },
                { value: 29842421, name: 'Immobilisations', itemStyle: { color: '#8A2BE2' } }
            ]);
        }

        function showPassifsDetails() {
            updateHeader('passifs', [
                '<a href="javascript:void(0);" class="link-light" onclick="goToOverview()">Vue d\'ensemble</a>',
                'Passifs'
            ]);
            updateChartData('Passifs', [
                { value: 5000000, name: 'Emprunts', itemStyle: { color: '#FF4500' } },
                { value: 7000000, name: 'Dettes fournisseurs', itemStyle: { color: '#DC143C' } },
                { value: 3000000, name: 'Autres passifs', itemStyle: { color: '#FF69B4' } }
            ]);
        }

        function showValeurNetteDetails() {
            updateHeader('valeurNette', [
                '<a href="javascript:void(0);" class="link-light" onclick="goToOverview()">Vue d\'ensemble</a>',
                'Valeur nette'
            ]);
            updateChartData('Valeur nette', [
                { value: 15000000, name: 'Capital social', itemStyle: { color: '#228B22' } },
                { value: 9000000, name: 'Réserves', itemStyle: { color: '#32CD32' } },
                { value: 5842421, name: 'Résultats non distribués', itemStyle: { color: '#6B8E23' } }
            ]);
        }

        function navigateToSubCategory(name, parentCategory) {
            const breadcrumbLinks = [
                '<a href="javascript:void(0);" class="link-light" onclick="goToOverview()">Vue d\'ensemble</a>',
                `<a href="javascript:void(0);" class="link-light" onclick="show${capitalizeFirstLetter(parentCategory)}Details()">${capitalizeFirstLetter(parentCategory)}</a>`,
                name
            ];

            updateHeader(parentCategory, breadcrumbLinks);
            updateChartData(name, [
                { value: 10000000, name: 'Sous-catégorie 1', itemStyle: { color: '#FFA07A' } },
                { value: 5000000, name: 'Sous-catégorie 2', itemStyle: { color: '#FF6347' } }
            ]);
        }

        function goToOverview() {
            updateHeader('overview', null);
            myChart.setOption(baseOption);
        }

        function updateChartData(name, data) {
            myChart.setOption({
                series: [
                    {
                        name: name,
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        data: data,
                        label: { show: false },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            });
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Redimensionne le graphique lors du redimensionnement de la fenêtre
        window.addEventListener('resize', function () {
            myChart.resize();
        });

        // Expose les fonctions pour les utiliser dans le fil d'Ariane (breadcrumbs)
        window.goToOverview = goToOverview;
        window.showActifsDetails = showActifsDetails;
        window.showPassifsDetails = showPassifsDetails;
        window.showValeurNetteDetails = showValeurNetteDetails;
    } catch (error) {
        console.error("Erreur lors de l'initialisation du graphique : ", error);
    }
});

/*
==========================================================================
Form Check Dynamique (Radio)
==========================================================================
*/

// Ajoutez ici les fonctions ou configurations spécifiques pour les radios dynamiques si nécessaire.
