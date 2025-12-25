import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Site Settings singleton
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.divider(),
      // Homepage singleton
      S.listItem()
        .title('Homepage')
        .id('homepage')
        .child(
          S.document()
            .schemaType('homepage')
            .documentId('homepage')
        ),
      S.divider(),
      // Agency Page singleton
      S.listItem()
        .title('Agency Page')
        .id('agencyPage')
        .child(
          S.document()
            .schemaType('agencyPage')
            .documentId('agencyPage')
        ),
      S.divider(),
      // Work Page singleton
      S.listItem()
        .title('Work Page')
        .id('workPage')
        .child(
          S.document()
            .schemaType('workPage')
            .documentId('workPage')
        ),
      S.divider(),
      // Rest of the document types (excluding singletons)
      ...S.documentTypeListItems().filter(
        (listItem) => !['siteSettings', 'homepage', 'agencyPage', 'workPage'].includes(listItem.getId() ?? '')
      ),
    ])
