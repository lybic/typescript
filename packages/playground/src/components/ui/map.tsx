import { useEffect, useRef, useState } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import { SearchIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MapProps {
  style?: React.CSSProperties
  className?: string
  onLocationChange?: (location?: { lng: number; lat: number }) => Promise<void>
}

declare global {
  interface Window {
    _AMapSecurityConfig: {
      serviceHost?: string
      securityJsCode?: string
    }
  }
}

let AMap: any = null

export default function Map({ style, className, onLocationChange }: MapProps) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const element = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{
    lng: number
    lat: number
    name?: string
    address?: string
  }>({ lng: 0, lat: 0 })

  const addMarker = (lng: number, lat: number) => {
    if (mapRef.current == null) {
      return
    }

    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    const markerContent = document.createElement('div')
    const markerImg = document.createElement('img')

    markerImg.className = 'markerlnglat'
    markerImg.src = '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
    markerImg.setAttribute('width', '25px')
    markerImg.setAttribute('height', '34px')
    markerContent.appendChild(markerImg)

    markerRef.current = new AMap.Marker({
      content: markerContent,
      position: [lng, lat],
      offset: new AMap.Pixel(-12, -34),
    })

    markerRef.current.setMap(mapRef.current)
  }

  const searchKeywordsHandler = (keywords: string) => {
    if (mapRef.current == null) {
      return
    }

    const placeSearch = new AMap.PlaceSearch({
      pageSize: 5,
      pageIndex: 1,
      citylimit: false,
      map: mapRef.current,
      panel: 'panel-location',
      autoFitView: true,
    })

    placeSearch.search(keywords, (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        placeSearch.on('selectChanged', ({ selected: { data: poi } }: any) => {
          const [lng, lat] = [poi.location.lng, poi.location.lat]

          setLocation({
            lng,
            lat,
            name: poi.name,
            address: poi.address,
          })

          addMarker(lng, lat)
        })
      }
    })
  }

  const initMap = () => {
    const map = new AMap.Map(element.current, {
      zoom: 13,
      keyboardEnable: true,
      resizeEnable: true,
    } as any)

    map.on('complete', () => {
      map.setDefaultCursor('crosshair')
      map.addControl(new AMap.Scale())
      map.addControl(new AMap.ToolBar({ ruler: true, direction: true, locate: false }))

      const auto = new AMap.AutoComplete({
        input: 'search-location',
        output: 'search-location-results',
      })

      auto.on('select', (e: any) => {
        searchKeywordsHandler(e.poi.name)
      })
    })

    map.on('click', (e: any) => {
      const [lng, lat] = [e.lnglat.getLng(), e.lnglat.getLat()]
      setLocation({ lng, lat })
      addMarker(lng, lat)
    })

    mapRef.current = map
  }

  useEffect(() => {
    if (element.current) {
      if (AMap != null) {
        initMap()
      } else {
        // see: https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode
        window._AMapSecurityConfig = {
          serviceHost: import.meta.env.DEV
            ? window.location.origin + '/_AMapService'
            : (import.meta.env.VITE_LYBIC_AMAP_URL ?? 'https://amap.lybic.cn') + '/_AMapService',
        }

        void AMapLoader.load({
          key: import.meta.env.VITE_LYBIC_AMAP_KEY,
          version: '2.0',
          plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.PlaceSearch', 'AMap.AutoComplete'],
        }).then((amap: any) => {
          AMap = amap

          initMap()
        })
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }

      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [element])

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute top-4 left-4 w-[400px] z-50">
        <div className="flex gap-2 w-full">
          <Input
            id="search-location"
            type="text"
            placeholder="Enter a location"
            className="flex-1 bg-background/95 backdrop-blur-sm shadow-lg"
          />
          <Button
            onClick={() => {
              const input = document.getElementById('search-location') as HTMLInputElement

              if (input) {
                searchKeywordsHandler(input.value)
              }
            }}
            size="icon"
            variant="outline"
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            <SearchIcon />
          </Button>
        </div>
        <div
          id="search-location-results"
          className="mt-2 bg-background/95 backdrop-blur-sm border border-border/30 rounded-md shadow-lg max-h-60 overflow-y-auto w-full z-50 [&_.amap-ui-poi-picker-list]:p-0 [&_.amap-ui-poi-picker-list-item]:px-3 [&_.amap-ui-poi-picker-list-item]:py-2 [&_.amap-ui-poi-picker-list-item]:cursor-pointer [&_.amap-ui-poi-picker-list-item]:border-b [&_.amap-ui-poi-picker-list-item:last-child]:border-b-0 [&_.amap-ui-poi-picker-list-item:hover]:bg-accent empty:hidden"
        />
      </div>
      <div className="flex-1 relative">
        <div ref={element} style={style} className={`w-full h-full ${className ?? ''}`}></div>
        <div
          id="panel-location"
          className="absolute bg-background/95 backdrop-blur-sm border border-border/30 rounded-md shadow-lg max-h-[calc(90%-100px)] overflow-y-auto top-[70px] left-4 w-[280px] z-20 empty:hidden"
        ></div>
      </div>
      <div className="px-6 py-3 border-t border-border bg-background z-[100]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            {location.name && <div className="text-sm font-semibold text-foreground truncate">{location.name}</div>}
            <div className="flex items-center gap-3 text-xs mt-1">
              {location.address && <span className="text-muted-foreground truncate">{location.address}</span>}
              <span className="text-muted-foreground shrink-0">·</span>
              <span className="font-mono text-foreground shrink-0">
                {location.lng.toFixed(6)}, {location.lat.toFixed(6)}
              </span>
            </div>
          </div>
          <Button
            onClick={async () => {
              if (location.lng !== 0 || location.lat !== 0) {
                setIsLoading(true)

                onLocationChange?.(location).finally(() => {
                  setIsLoading(false)
                })
              }
            }}
            size="icon"
            title="Confirm location"
            isLoading={isLoading}
          >
            <Check />
          </Button>
        </div>
      </div>
    </div>
  )
}
