from pathlib import Path
root=Path(__file__).parent
html=(root/'template.html').read_text()
for marker,name in [('/*STYLE*/','style.css'),('/*ENGINE*/','engine.js'),('/*CONTENT*/','content.js'),('/*APP*/','app.js')]:
    html=html.replace(marker,(root/name).read_text())
(root/'index.html').write_text(html)
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
print('Built standalone index.html')
