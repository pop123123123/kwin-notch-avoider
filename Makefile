PKGFILE = notch.kwinscript

build: package
	(cd package && zip -r $(PKGFILE) ./*)
	(cd package && mv $(PKGFILE) ../)

install: build
	kpackagetool5 -t KWin/Script -s notch \
		&& kpackagetool5 -u $(PKGFILE) \
		|| kpackagetool5 -i $(PKGFILE)	

uninstall:
	kpackagetool5 -t KWin/Script -r notch

clean:
	rm -f $(PKGFILE)