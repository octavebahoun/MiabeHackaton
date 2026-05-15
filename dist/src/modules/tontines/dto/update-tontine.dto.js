"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTontineDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const create_tontine_dto_1 = require("./create-tontine.dto");
class UpdateTontineDto extends (0, swagger_1.PartialType)(create_tontine_dto_1.CreateTontineDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateTontineDto = UpdateTontineDto;
//# sourceMappingURL=update-tontine.dto.js.map