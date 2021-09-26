import { SwaggerConfig } from "@ioc:Adonis/Addons/Swagger";

export default {
  uiEnabled: true, //disable or enable swaggerUi route
  uiUrl: "docs", // url path to swaggerUI
  specEnabled: true, //disable or enable swagger.json route
  specUrl: "/swagger.json",

  middleware: [], // middlewares array, for protect your swagger docs and spec endpoints

  options: {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Aplikasi Main Bareng",
        version: "1.0.0",
        description:
          "Aplikasi Main Bareng untuk mempertemukan pemuda-pemuda yang ingin berolahraga tim (futsal/voli/basket/minisoccer/soccer) dan booking tempat bersama. ",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
        parameters: {
          venue_id: {
            in: "path",
            name: "venue_id",
            required: true,
            $ref: "#/components/schemas/pathSchema",
            description: "ID dari venue",
          },
          id: {
            in: "path",
            name: "id",
            required: true,
            $ref: "#/components/schemas/pathSchema",
            description: "ID dari venue/field/booking",
          },
        },
        schemas: {
          unprocessableEntitySchemas1: {
            type: "object",
            properties: {
              msg: {
                type: "string",
              },
              error: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    rule: {
                      type: "string",
                    },
                    field: {
                      type: "string",
                    },
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          otp_confirmationSchema: {
            type: "object",
            properties: {
              email: {
                type: "string",
              },
              otp_code: {
                type: "string",
              },
            },
            required: ["email", "otp_code"],
          },
          loginSchema: {
            type: "object",
            properties: {
              email: {
                type: "string",
              },
              password: {
                type: "string",
              },
            },
            required: ["email", "password"],
          },
          pathSchema: {
            schema: {
              type: "number",
              minimum: 1,
            },
          },
          UpdateVenueBody: {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                phone: {
                  type: "string",
                },
                address: {
                  type: "string",
                },
              },
            },
          },
          UpdateFieldBody: {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                type: {
                  type: "string",
                  enum: [
                    "soccer",
                    "mini soccer",
                    "futsal",
                    "basketball",
                    "volleyball",
                  ],
                },
              },
            },
          },
        },
        responses: {
          CreatedData: {
            description: "Berhasil menambahkan data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "string",
                      example: "Berhasil menambahkan data",
                    },
                  },
                },
              },
            },
          },
          UpdateData: {
            description: "Berhasil update data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "string",
                      example: "Berhasil update data",
                    },
                  },
                },
              },
            },
          },
          FailedUpdatedData: {
            description: "Data gagal diperbarui / data tidak ada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "string",
                      example: "Data gagal diupdate data",
                    },
                    error: {
                      type: "string",
                      example: "E_ROW_NOT_FOUND: Row not found",
                    },
                  },
                },
              },
            },
          },
          DeletedData: {
            description: "Berhasil delete data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "string",
                      example: "Berhasil delete data",
                    },
                  },
                },
              },
            },
          },
          FailedDeleteData: {
            description: "Data gagal dihapus / data tidak ada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "string",
                      example: "Data gagal dihapus / data tidak ada",
                    },
                    error: {
                      type: "string",
                      example: "E_ROW_NOT_FOUND: Row not found",
                    },
                  },
                },
              },
            },
          },
          Unauthorized: {
            description: "Anda tidak memiliki hak akses",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "string",
                      example: "E_UNAUTHORIZED_ACCESS: Unauthorized access",
                    },
                  },
                },
              },
            },
          },
          NotFound: {
            description: "Data tidak ditemukan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "Data tidak ada",
                      example: "E_ROW_NOT_FOUND: Row not found",
                    },
                    error: {
                      type: "string",
                      example: "E_ROW_NOT_FOUND: Row not found",
                    },
                  },
                },
              },
            },
          },

          VenueNotFound: {
            description: "Data tidak ditemukan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: {
                      type: "string",
                      example: "Data venue tidak ada",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    apis: ["app/**/*.ts", "docs/swagger/**/*.yml", "start/routes.ts"],
    basePath: "/",
  },
  mode: process.env.NODE_ENV === "production" ? "PRODUCTION" : "RUNTIME",
  specFilePath: "docs/swagger.json",
} as SwaggerConfig;
