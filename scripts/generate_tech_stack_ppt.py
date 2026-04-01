from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from textwrap import shorten
from xml.sax.saxutils import escape
import os
import zipfile


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "SmartNotice-Tech-Stack-Presentation.pptx"


SLIDES = [
    {
        "title": "SmartNotice",
        "subtitle": "Tech Stack Presentation\nSmart College Notice Board\nGenerated from the current codebase",
    },
    {
        "title": "Project Overview",
        "bullets": [
            "Full-stack web application for publishing, filtering, pinning, archiving, and tracking college notices.",
            "Frontend is a React dashboard for students, HODs, and admins.",
            "Backend is an Express API with TypeScript, MongoDB Atlas, file uploads, and role-based access.",
            "Attachments are uploaded through Cloudinary and linked back to notices.",
        ],
    },
    {
        "title": "Architecture",
        "bullets": [
            "Browser client talks to the backend over HTTP using Axios.",
            "Express API exposes auth, category, and notice endpoints.",
            "Mongoose models persist users, categories, and notices in MongoDB Atlas.",
            "The server can also serve the built React app in production.",
        ],
    },
    {
        "title": "Frontend Stack",
        "bullets": [
            "React 19 with ReactDOM and Create React App via react-scripts.",
            "State is managed with React hooks such as useState, useEffect, useMemo, and useRef.",
            "Axios handles API requests and injects bearer tokens through an interceptor.",
            "Tailwind CSS is used for utility styling, with additional global CSS variables and custom classes.",
            "Browser Notifications API is used for notice alerts, with polling every 30 seconds.",
        ],
    },
    {
        "title": "Backend Stack",
        "bullets": [
            "Express 5 powers the REST API.",
            "TypeScript is used on the server with strict mode enabled and compiled to dist.",
            "dotenv loads environment configuration for database, auth, CORS, and cloud storage.",
            "cors enables cross-origin requests from approved client origins.",
            "Multer handles multipart uploads before files are pushed to Cloudinary.",
        ],
    },
    {
        "title": "Data, Auth, and Storage",
        "bullets": [
            "MongoDB Atlas is the primary database, accessed through Mongoose models.",
            "Core collections are User, Category, and Notice.",
            "Passwords are hashed with Node crypto scrypt and compared with timing-safe checks.",
            "Authentication uses a custom HMAC-signed token stored in an httpOnly cookie and also returned to the client.",
            "Role middleware protects actions such as creating notices and managing categories.",
        ],
    },
    {
        "title": "Request Flow",
        "bullets": [
            "User opens the React dashboard and the app loads session, categories, and notice data.",
            "Axios sends requests to /api/auth, /api/categories, and /api/notices.",
            "Express middleware parses JSON, attaches the authenticated user, and enforces roles where needed.",
            "Controllers validate inputs, query or update MongoDB, upload attachments if present, and return JSON responses.",
            "The frontend re-renders with the latest state and can trigger browser notifications for subscribed categories.",
        ],
    },
    {
        "title": "Tooling and Delivery",
        "bullets": [
            "Client build and dev flow are provided by react-scripts.",
            "Server development uses nodemon plus ts-node for live TypeScript execution.",
            "Production backend starts from compiled JavaScript in dist.",
            "The app can run as separate client and server services or as a single Express-served deployment.",
        ],
    },
    {
        "title": "Key Strengths",
        "bullets": [
            "Simple and understandable architecture.",
            "Clear separation between frontend, API, models, middleware, and services.",
            "Typed backend domain model with practical role-based access control.",
            "Cloud-hosted persistence and file storage reduce local deployment complexity.",
            "Easy to extend with more analytics, realtime delivery, or stronger automated testing.",
        ],
    },
]


def emu(value_in_inches: float) -> int:
    return int(value_in_inches * 914400)


def xml(text: str) -> str:
    return escape(text)


def bullet_runs(text: str, level: int = 0) -> str:
    return f"""
    <a:p>
      <a:pPr lvl="{level}" marL="342900" indent="-171450">
        <a:buChar char="•"/>
      </a:pPr>
      <a:r>
        <a:rPr lang="en-US" sz="2200" dirty="0"/>
        <a:t>{xml(text)}</a:t>
      </a:r>
    </a:p>
    """.strip()


def subtitle_runs(text: str) -> str:
    parts = [p for p in text.split("\n") if p]
    out = []
    for i, part in enumerate(parts):
        out.append(
            f"""
    <a:p>
      <a:pPr algn="l"/>
      <a:r>
        <a:rPr lang="en-US" sz="{2200 if i == 0 else 1800}" dirty="0"/>
        <a:t>{xml(part)}</a:t>
      </a:r>
    </a:p>
            """.strip()
        )
    return "\n".join(out)


def make_slide_xml(title: str, bullets: list[str] | None = None, subtitle: str | None = None) -> str:
    title_block = f"""
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="2" name="Title 1"/>
        <p:cNvSpPr/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="{emu(0.7)}" y="{emu(0.45)}"/>
          <a:ext cx="{emu(11.0)}" cy="{emu(0.8)}"/>
        </a:xfrm>
      </p:spPr>
      <p:txBody>
        <a:bodyPr/>
        <a:lstStyle/>
        <a:p>
          <a:r>
            <a:rPr lang="en-US" sz="2800" b="1" dirty="0"/>
            <a:t>{xml(title)}</a:t>
          </a:r>
        </a:p>
      </p:txBody>
    </p:sp>
    """.strip()

    accent_bar = f"""
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="3" name="Accent"/>
        <p:cNvSpPr/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="{emu(0.7)}" y="{emu(1.28)}"/>
          <a:ext cx="{emu(2.2)}" cy="{emu(0.08)}"/>
        </a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        <a:solidFill><a:srgbClr val="3B82F6"/></a:solidFill>
      </p:spPr>
      <p:style>
        <a:lnRef idx="0"><a:schemeClr val="accent1"/></a:lnRef>
        <a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef>
        <a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef>
        <a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef>
      </p:style>
      <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
    </p:sp>
    """.strip()

    if subtitle is not None:
        body_content = subtitle_runs(subtitle)
    else:
        body_content = "\n".join(bullet_runs(shorten(item, width=140, placeholder="...")) for item in (bullets or []))

    body_block = f"""
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="4" name="Content 2"/>
        <p:cNvSpPr txBox="1"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="{emu(0.85)}" y="{emu(1.7)}"/>
          <a:ext cx="{emu(11.2)}" cy="{emu(4.9)}"/>
        </a:xfrm>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square"/>
        <a:lstStyle/>
        {body_content}
      </p:txBody>
    </p:sp>
    """.strip()

    footer_block = f"""
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="5" name="Footer"/>
        <p:cNvSpPr txBox="1"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="{emu(0.7)}" y="{emu(6.75)}"/>
          <a:ext cx="{emu(11.3)}" cy="{emu(0.35)}"/>
        </a:xfrm>
      </p:spPr>
      <p:txBody>
        <a:bodyPr/>
        <a:lstStyle/>
        <a:p>
          <a:r>
            <a:rPr lang="en-US" sz="1200" dirty="0"/>
            <a:t>{xml('SmartNotice | Tech Stack Deck')}</a:t>
          </a:r>
        </a:p>
      </p:txBody>
    </p:sp>
    """.strip()

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      {title_block}
      {accent_bar}
      {body_block}
      {footer_block}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>
"""


def content_types_xml(slide_count: int) -> str:
    slide_overrides = "\n".join(
        f'  <Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, slide_count + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
  <Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
  <Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
{slide_overrides}
</Types>
"""


def root_rels_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""


def app_xml(slide_count: int) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>OpenAI Codex</Application>
  <PresentationFormat>On-screen Show (4:3)</PresentationFormat>
  <Slides>{slide_count}</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Theme</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>Office Theme</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>OpenAI</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>1.0</AppVersion>
</Properties>
"""


def core_xml() -> str:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>SmartNotice Tech Stack Presentation</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>
"""


def presentation_xml(slide_count: int) -> str:
    sld_ids = "\n".join(
        f'    <p:sldId id="{256 + i}" r:id="rId{i + 1}"/>'
        for i in range(1, slide_count + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                saveSubsetFonts="1" autoCompressPictures="0">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId{slide_count + 1}"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
{sld_ids}
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle/>
</p:presentation>
"""


def presentation_rels_xml(slide_count: int) -> str:
    slide_rels = "\n".join(
        f'  <Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, slide_count + 1)
    )
    master_rel = f'  <Relationship Id="rId{slide_count + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
    theme_rel = f'  <Relationship Id="rId{slide_count + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>'
    pres_rel = f'  <Relationship Id="rId{slide_count + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>'
    view_rel = f'  <Relationship Id="rId{slide_count + 4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>'
    table_rel = f'  <Relationship Id="rId{slide_count + 5}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>'
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
{slide_rels}
{master_rel}
{theme_rel}
{pres_rel}
{view_rel}
{table_rel}
</Relationships>
"""


def slide_rels_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
"""


def slide_master_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld name="Office Theme">
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="F8FAFC"/></a:solidFill>
        <a:effectLst/>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="1" r:id="rId1"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle/>
    <p:bodyStyle/>
    <p:otherStyle/>
  </p:txStyles>
</p:sldMaster>
"""


def slide_master_rels_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
"""


def slide_layout_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
             type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>
"""


def slide_layout_rels_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
"""


def theme_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="SmartNotice Theme">
  <a:themeElements>
    <a:clrScheme name="SmartNotice">
      <a:dk1><a:srgbClr val="0F172A"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="1E293B"/></a:dk2>
      <a:lt2><a:srgbClr val="F8FAFC"/></a:lt2>
      <a:accent1><a:srgbClr val="3B82F6"/></a:accent1>
      <a:accent2><a:srgbClr val="0EA5E9"/></a:accent2>
      <a:accent3><a:srgbClr val="14B8A6"/></a:accent3>
      <a:accent4><a:srgbClr val="F59E0B"/></a:accent4>
      <a:accent5><a:srgbClr val="8B5CF6"/></a:accent5>
      <a:accent6><a:srgbClr val="475569"/></a:accent6>
      <a:hlink><a:srgbClr val="2563EB"/></a:hlink>
      <a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="SmartNotice Fonts">
      <a:majorFont>
        <a:latin typeface="Aptos Display"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Aptos"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="SmartNotice Format">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="accent1"/></a:gs>
            <a:gs pos="100000"><a:schemeClr val="accent2"/></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln>
        <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln>
        <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="lt1"/></a:solidFill>
        <a:solidFill><a:schemeClr val="lt2"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>
"""


def pres_props_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>
"""


def view_props_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:viewPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
          xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
          lastView="slideSorterView">
  <p:normalViewPr/>
  <p:slideViewPr/>
  <p:notesTextViewPr/>
  <p:gridSpacing cx="72008" cy="72008"/>
</p:viewPr>
"""


def table_styles_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>
"""


def build_pptx(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    slide_count = len(SLIDES)
    if output_path.exists():
      output_path.unlink()

    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types_xml(slide_count))
        zf.writestr("_rels/.rels", root_rels_xml())
        zf.writestr("docProps/app.xml", app_xml(slide_count))
        zf.writestr("docProps/core.xml", core_xml())
        zf.writestr("ppt/presentation.xml", presentation_xml(slide_count))
        zf.writestr("ppt/_rels/presentation.xml.rels", presentation_rels_xml(slide_count))
        zf.writestr("ppt/presProps.xml", pres_props_xml())
        zf.writestr("ppt/viewProps.xml", view_props_xml())
        zf.writestr("ppt/tableStyles.xml", table_styles_xml())
        zf.writestr("ppt/slideMasters/slideMaster1.xml", slide_master_xml())
        zf.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", slide_master_rels_xml())
        zf.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout_xml())
        zf.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slide_layout_rels_xml())
        zf.writestr("ppt/theme/theme1.xml", theme_xml())

        for index, slide in enumerate(SLIDES, start=1):
            slide_xml = make_slide_xml(
                slide["title"],
                bullets=slide.get("bullets"),
                subtitle=slide.get("subtitle"),
            )
            zf.writestr(f"ppt/slides/slide{index}.xml", slide_xml)
            zf.writestr(f"ppt/slides/_rels/slide{index}.xml.rels", slide_rels_xml())


if __name__ == "__main__":
    build_pptx(OUTPUT)
    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"Created {OUTPUT} ({size_kb:.1f} KB)")
