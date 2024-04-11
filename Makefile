archive:
	@echo "Archiving..."
	@zip -r archive.zip . -x ".git*" -x "*/.*" -x "Makefile" -x "archive.zip"
.Phony: archive

clean:
	@echo "Cleaning..."
	@rm -rf archive
	@rm -f archive.zip
.Phony: clean