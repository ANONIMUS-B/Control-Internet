<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 1cm 2.5cm 2.5cm 2.5cm;
        }

        body {
            font-family: "Times New Roman", serif;
            font-size: 11pt;
            line-height: 1.35;
            color: #000;
            margin: 0;
            padding: 0;
        }

        /* ==========================
           ENCABEZADO E IMAGEN
        ========================== */
        .header-logo-container {
            text-align: center;
            margin-bottom: 8px;
        }

        .header-logo-img {
            width: 100%;
            max-height: 75px;
            object-fit: contain;
        }

        .header-top {
            text-align: center;
            font-size: 10pt;
            font-style: italic;
            margin-bottom: 25px;
        }

        .fecha-top {
            text-align: right;
            font-size: 11pt;
            margin-bottom: 25px;
        }

        /* ==========================
           NUMERO DE OFICIO
        ========================== */
        .oficio-numero {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        /* ==========================
           DATOS DEL OFICIO (TABLA PERFECTA)
        ========================== */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .info-table td {
            vertical-align: top;
            padding-bottom: 12px;
        }

        .info-table .col-label {
            width: 130px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .info-table .col-colon {
            width: 20px;
            font-weight: bold;
            text-align: center;
        }

        .info-table .col-content {
            text-align: justify;
        }

        /* ==========================
           SEPARADOR
        ========================== */
        .linea-separadora {
            border: 0;
            border-top: 1.5px solid #000;
            margin: 15px 0 20px 0;
        }

        /* ==========================
           CUERPO
        ========================== */
        .cuerpo {
            text-align: justify;
        }

        .cuerpo p {
            margin-bottom: 14px;
            line-height: 1.4;
        }

        /* ==========================
           FIRMA
        ========================== */
        .firma-container {
            margin-top: 60px;
            text-align: center;
            page-break-inside: avoid;
        }

        .firma-img {
            max-width: 220px;
            max-height: 100px;
            display: block;
            margin: auto;
        }

        .firma-nombre {
            font-weight: bold;
            text-transform: uppercase;
            border-top: 1px solid #000;
            display: inline-block;
            padding-top: 4px;
            margin-top: 15px;
            min-width: 240px;
        }

        .firma-cargo {
            font-size: 10pt;
            display: block;
            text-transform: uppercase;
        }

        /* ==========================
           EVIDENCIAS
        ========================== */
        .anexo-titulo {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .pagina-evidencia {
            page-break-before: always;
        }

        .evidencia-item {
            text-align: center;
            margin-bottom: 20px;
        }

        .evidencia-img {
            width: 100%;
            max-height: 620px;
            object-fit: contain;
            border: 1px solid #999;
            padding: 4px;
        }

        .evidencia-caption {
            margin-top: 8px;
            font-size: 10pt;
            font-style: italic;
        }
    </style>
</head>

<body>

    <!-- CABECERA CON IMAGEN DE LOGOS -->
    @if(!empty($headerLogoBase64))
        <div class="header-logo-container">
            <img src="{{ $headerLogoBase64 }}" class="header-logo-img" alt="Encabezado Logos">
        </div>
    @endif

    <!-- ENCABEZADO TEXTO -->
    <div class="header-top">
        "Año de la Esperanza y el Fortalecimiento de la Democracia"
    </div>

    <!-- FECHA - CORREGIDO -->
    <div class="fecha-top">
        Ambo, {{ now()->format('d') }} de 
        @php
            $meses = [
                1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
            ];
            $mes = $meses[now()->format('n')];
        @endphp
        {{ $mes }} de {{ now()->format('Y') }}.
    </div>

    <!-- NUMERO DE OFICIO -->
    <div class="oficio-numero">
        OFICIO N° {{ $report->office_number ?? 'S/N' }}-{{ $report->year }}- D.I.E.I N°{{ $report->institution->modular_code ?? '000' }}- UGEL AMBO
    </div>

    <!-- DATOS DEL OFICIO (TABLA ESTRUCTURADA) -->
    <table class="info-table">
        <tr>
            <td class="col-label">SEÑOR</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                <strong>HUGO EDUARDO PALOMINO ESTEBAN</strong><br>
                Director de la Unidad de Gestión Educativa Local de Ambo
            </td>
        </tr>
        <tr>
            <td class="col-label">ASUNTO</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                Remito Acta de Conformidad del Servicio de Internet de la Institución Educativa
                "<strong>{{ $report->institution->name ?? '' }}</strong>",
                correspondiente al mes de
                <strong>{{ ucfirst($report->month_name ?? '') }}</strong> de
                <strong>{{ $report->year }}</strong>.
            </td>
        </tr>
        <tr>
            <td class="col-label">REFERENCIA</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                DIRECTIVA N.° 001-2024-UGEL-AMBO
            </td>
        </tr>
    </table>

    <hr class="linea-separadora">

    <!-- CUERPO DEL OFICIO -->
    <div class="cuerpo">
        <p>
            Tengo el honor de dirigirme a usted para expresarle mi cordial saludo
            y, al mismo tiempo, informarle que se ha realizado la verificación del
            servicio de Internet brindado a la Institución Educativa con código
            modular <strong>{{ $report->institution->modular_code ?? '' }}</strong>,
            ubicada en el distrito de <strong>{{ $report->institution->district ?? '' }}</strong>,
            correspondiente al mes de <strong>{{ ucfirst($report->month_name ?? '') }}</strong>
            del presente año.
        </p>

        <p>
            Como resultado de la verificación efectuada, se deja constancia que
            el servicio presenta el siguiente estado:
            <strong>{{ strtoupper($stateLabels[$report->service_state] ?? $report->service_state) }}</strong>,
            conforme a la evaluación realizada y a las evidencias obtenidas durante el periodo reportado.
        </p>

        <p>
            En tal sentido, me permito remitir las evidencias fotográficas
            correspondientes al periodo informado, a fin de que sirvan de sustento
            de la conformidad emitida y para las acciones administrativas que
            estime pertinentes.
        </p>

        <p>
            Sin otro particular, hago propicia la oportunidad para expresarle
            los sentimientos de mi especial consideración y estima personal.
        </p>

        <p>
            Atentamente,
        </p>
    </div>

    <!-- FIRMA -->
    <div class="firma-container">
        @if($signatureBase64)
            <img src="{{ $signatureBase64 }}" class="firma-img" alt="Firma">
        @endif
        <br>

        <div class="firma-nombre">
            {{ $report->user->name ?? 'DIRECTOR(A)' }}
        </div>
        <div class="firma-cargo">
            DIRECTOR(A) DE LA INSTITUCIÓN EDUCATIVA
        </div>
        <div style="font-size:9.5pt;">
            DNI: {{ $report->user->dni ?? '........' }}
        </div>
    </div>

    <!-- ==========================================================
                        ANEXO DE EVIDENCIAS
    =========================================================== -->
    @if(isset($evidenciasBase64) && count($evidenciasBase64) > 0)

        @foreach($evidenciasBase64 as $index => $img)
            <div class="pagina-evidencia"></div>

            @if(!empty($headerLogoBase64))
                <div class="header-logo-container">
                    <img src="{{ $headerLogoBase64 }}" class="header-logo-img" alt="Encabezado Logos">
                </div>
            @endif

            <div class="header-top">
                "Año de la Esperanza y el Fortalecimiento de la Democracia"
            </div>

            <div class="anexo-titulo">
                ANEXO: EVIDENCIAS FOTOGRÁFICAS DEL SERVICIO DE INTERNET
            </div>

            <div class="evidencia-item">
                <img src="{{ $img }}" class="evidencia-img" alt="Evidencia {{ $index + 1 }}">
                <div class="evidencia-caption">
                    Evidencia fotográfica N.° {{ $index + 1 }}
                </div>
            </div>
        @endforeach

    @endif

</body>

</html>