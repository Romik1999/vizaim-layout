$(document).ready(function () {
    if (typeof dadataToken === 'undefined' || !dadataToken) {
        console.log('website does not have dadata account')
    } else {
        var $container = $('form');

        $container.find('[name*="fullName"]').suggestions({
            token: dadataToken,
            type: "NAME",
            params: {
                parts: ["SURNAME", "NAME", "PATRONYMIC"]
            }
        });

        $container.find('[name*="firstName"]').suggestions({token: dadataToken, type: "NAME", params: {parts: ["NAME"]}});
        $container.find('[name*="lastName"]').suggestions({token: dadataToken, type: "NAME", params: {parts: ["SURNAME"]}});
        $container.find('[name*="middleName"]').suggestions({token: dadataToken, type: "NAME", params: {parts: ["PATRONYMIC"]}});

        var type = "ADDRESS",
            $actualRegion = $container.find('[name*="actualRegion"]'),
            $actualCity = $container.find('[name*="actualCity"]'),
            $registrationRegion = $container.find('[name*="registrationRegion"]'),
            $registrationCity = $container.find('[name*="registrationCity"]'),
            $registrationStreet = $container.find('[name*="registrationStreet"]'),
            $registrationHouse = $container.find('[name*="registrationHouse"]'),
            $fms = $container.find('[name*="passportIssuedCode"]');

        $actualRegion.suggestions({
            token: dadataToken,
            type: type,
            hint: false,
            bounds: "region-area",
            onSelect: function (suggestion) {
                $actualRegion.change();
            }
        });
        $actualCity.suggestions({
            token: dadataToken,
            type: type,
            hint: false,
            bounds: "city-settlement",
            constraints: $actualRegion,
            formatSelected: function (suggestion) {
                return suggestion.data.city;
            },
            onSelect: function (suggestion) {
                $actualCity.change();
            }
        });
        $registrationRegion.suggestions({
            token: dadataToken,
            type: type,
            hint: false,
            bounds: "region-area",
            onSelect: function (suggestion) {
                $container.find('[name*="registrationRegionFiasCode"]').val(suggestion.data.fias_code);
                $container.find('[name*="registrationRegionFiasId"]').val(suggestion.data.region_fias_id);
                $container.find('[name*="registrationRegionKladrId"]').val(suggestion.data.region_kladr_id);

                $registrationRegion.change();
            }
        });
        $registrationCity.suggestions({
            token: dadataToken,
            type: type,
            hint: false,
            bounds: "city-settlement",
            constraints: $registrationRegion,
            formatSelected: function (suggestion) {
                return suggestion.data.city;
            },
            onSelect: function (suggestion) {
                $container.find('[name*="registrationCityFiasCode"]').val(suggestion.data.fias_code);
                $container.find('[name*="registrationCityFiasId"]').val(suggestion.data.city_fias_id);
                $container.find('[name*="registrationCityKladrId"]').val(suggestion.data.city_kladr_id);

                $registrationCity.change();
            }
        });
        $registrationStreet.suggestions({
            token: dadataToken,
            type: type,
            hint: false,
            bounds: "street",
            constraints: $registrationCity,
            count: 15,
            onSelect: function (suggestion) {
                $container.find('[name*="registrationStreetFiasCode"]').val(suggestion.data.fias_code);
                $container.find('[name*="registrationStreetFiasId"]').val(suggestion.data.street_fias_id);
                $container.find('[name*="registrationStreetKladrId"]').val(suggestion.data.street_kladr_id);

                $registrationStreet.change();
            }
        });
        $registrationHouse.suggestions({
            token: dadataToken,
            type: type,
            hint: false,
            bounds: "house",
            constraints: $registrationStreet,
            formatSelected: function (suggestion) {
                return suggestion.data.house;
            },
            onSelect: function (suggestion) {
                $container.find('[name*="registrationHouseFiasCode"]').val(suggestion.data.fias_code);
                $container.find('[name*="registrationHouseFiasId"]').val(suggestion.data.house_fias_id);
                $container.find('[name*="registrationHouseKladrId"]').val(suggestion.data.house_kladr_id);

                $registrationHouse.change();
            }
        });

        // find fms name by code
        $fms.suggestions({
            url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit",
            token: dadataToken,
            type: "PARTY",
            count: 20,
            onSelect: function (suggestion) {
                $fms.val(suggestion.data.code)
                $container.find('[name*="passportIssued"]')
                    .not('[name*="passportIssuedCode"]')
                    .not('[name*="passportIssuedDate"]')
                    .val(suggestion.data.name);
            }
        });
    }
});
