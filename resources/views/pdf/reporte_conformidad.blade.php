<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 1.5cm 2.5cm 2.5cm 2.5cm;
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

        /* ==========================
           NUMERO DE INFORME
        ========================== */
        .informe-numero {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        /* ==========================
           DATOS DEL INFORME (TABLA)
        ========================== */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        .info-table td {
            vertical-align: top;
            padding-bottom: 10px;
        }

        .info-table .col-label {
            width: 110px;
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
            margin: 10px 0 20px 0;
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
            text-indent: 30px;
        }

        .cuerpo .sin-sangria {
            text-indent: 0;
        }

        /* ==========================
           FIRMA
        ========================== */
        .firma-container {
            margin-top: 50px;
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
            min-width: 260px;
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
            font-size: 12pt;
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

    <!-- NUMERO DE INFORME -->
    <div class="informe-numero">
        INFORME N° {{ $report->office_number ?? '000' }}-{{ $report->year }}-D.I.E. N° {{ $report->institution->modular_code ?? '000' }}
    </div>

    <!-- DATOS DEL ENCABEZADO TIPO INFORME -->
    <table class="info-table">
        <tr>
            <td class="col-label">AL</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                <strong>Dr. HUGO E. PALOMINO ESTEBAN</strong><br>
                Director de la Unidad de Gestión Educativa Local de Ambo.
            </td>
        </tr>
        <tr>
            <td class="col-label">DEL</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                <strong>{{ $report->user->name ?? 'DIRECTOR(A)' }}</strong><br>
                Director de la I.E. {{ $report->institution->name ?? 'N°' }}
            </td>
        </tr>
        <tr>
            <td class="col-label">ASUNTO</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                Informe de conformidad sobre el servicio de internet en la Institución Educativa <strong>{{ $report->institution->name ?? '' }}</strong>
            </td>
        </tr>
        <tr>
            <td class="col-label">REF.</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                Contrato N° 003-{{ $report->year ?? '2026' }}-UGEL Ambo
            </td>
        </tr>
        <tr>
            <td class="col-label">FECHA</td>
            <td class="col-colon">:</td>
            <td class="col-content">
                @php
                    $meses = [
                        1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
                        5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
                        9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre'
                    ];
                    $mesActual = $meses[(int)now()->format('n')];
                @endphp
                Ambo, {{ now()->format('d') }} de {{ $mesActual }} de {{ now()->format('Y') }}.
            </td>
        </tr>
    </table>

    <hr class="linea-separadora">

    <!-- CUERPO DEL INFORME -->
    <div class="cuerpo">
        <p>
            Tengo el agrado de dirigirme a usted para saludarle cordialmente y, a la vez, informar que, habiéndose realizado la instalación de equipos tecnológicos se está dando el uso correspondiente del servicio de internet en la Institución Educativa <strong>{{ $report->institution->name ?? '' }}</strong>, informo que dicho servicio se encuentra <strong>{{ strtoupper($stateLabels[$report->service_state] ?? ($report->service_state ?? 'operativo')) }}</strong> y en adecuado funcionamiento, permitiendo el acceso a recursos digitales, plataformas educativas y el desarrollo de actividades pedagógicas y administrativas de manera oportuna.
        </p>

        <p>
            Asimismo, durante su uso se evidenció que la conectividad brinda las condiciones necesarias para fortalecer los procesos de enseñanza y aprendizaje, facilitando el acceso a información y herramientas tecnológicas en beneficio de estudiantes, docentes y personal directivo.
        </p>

        <p>
            En ese sentido, al haberse comprobado la operatividad y funcionamiento del servicio conforme a las necesidades de la institución educativa, se otorga la <strong>conformidad y estado situacional</strong> del servicio de internet del mes de <strong>{{ ucfirst($report->month_name ?? '') }} de {{ $report->year }}</strong> por cumplir con las condiciones requeridas para su adecuado uso en la Institución Educativa <strong>{{ $report->institution->name ?? '' }}</strong>.
        </p>

        <p>
            Es todo cuanto informo a usted para su conocimiento y fines pertinentes.
        </p>

        <p class="sin-sangria">
            Atentamente,
        </p>
    </div>

    <!-- FIRMA -->
    <div class="firma-container">
        @if(!empty($signatureBase64))
            <img src="{{ $signatureBase64 }}" class="firma-img" alt="Firma">
        @endif
        <br>

        <div class="firma-nombre">
            {{ $report->user->name ?? 'DIRECTOR(A)' }}
        </div>
        <div class="firma-cargo">
            DIRECTOR(A) DE LA I.E. {{ $report->institution->name ?? '' }}
        </div>
        <div style="font-size: 9.5pt;">
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