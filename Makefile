build:
	@echo "Building..."
	@npm run build
.Phony: build

archive:
	@echo "Archiving..."
	@cp -R node_modules build/
	@cd build
	@zip -r ../archive.zip . -x ".git*" -x "*/.*" -x "Makefile" -x "archive.zip"
.Phony: archive

clean:
	@echo "Cleaning..."
	@rm -rf archive*
	@rm -rf build*
.Phony: clean