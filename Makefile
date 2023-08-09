build-installer: 
	pyinstaller -y -F -n installer -p /update --workpath ./updaterbuild --distpath ./update update/update.py

build-server-mac:
	pyinstaller -y -D -n metavoice --workpath pyinstallerbuild \
		-p ${METAVOICECODE_ROOT} \
		--add-data=${SITE_PACKAGES}/librosa/util/example_data:librosa/util/example_data \
		--add-data=${SITE_PACKAGES}/_soundfile_data:_soundfile_data \
		--add-data=${METAVOICECODE_ROOT}/ai:ai \
		ai/mvl.py
	
	echo local > dist/metavoice/version.txt

build-server-windows:
	pyinstaller -y -D -n metavoice --workpath pyinstallerbuild \
		-p ${METAVOICECODE_ROOT} \
		--add-data="${SITE_PACKAGES}/librosa/util/example_data;librosa/util/example_data" \
		--add-data="${SITE_PACKAGES}/_soundfile_data;_soundfile_data" \
		--add-data="${METAVOICECODE_ROOT}/ai;ai" \
		ai/mvl.py

	python deploy_remove.py windows

	echo local > dist/metavoice/version.txt

deploy-server:
	python deploy_ml.py
